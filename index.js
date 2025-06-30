import express from "express";
import { streamAndUpload } from "./controllers/cloudinary_functions.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import { v2 as cloudinary } from 'cloudinary';

// Import models
import User from "./models/User.js";
import Post from "./models/Post.js";
import Notification from "./models/Notification.js";

dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Middleware
app.use(morgan('dev'));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        console.log('MongoDB URI:', process.env.MONGO_URI); // This will help debug connection issues
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if MongoDB connection fails
    });

// Routes

// User routes
app.post("/users", async (req, res) => {
    try {
        console.log('User login/register request:', req.body);
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        // Try to find existing user
        let user = await User.findOne({ username });
        
        if (user) {
            console.log('Existing user found:', user);
            return res.status(200).json(user);
        }

        // Create new user if doesn't exist
        user = await User.create({ username });
        console.log('New user created:', user);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error in user login/register:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get user by ID
app.get("/users/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers', 'username')
            .populate('following', 'username');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's posts
app.get("/users/:userId/posts", async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('user', 'username');
        res.json(posts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Post routes
app.post("/posts", async (req, res) => {
    try {
        const uploadResult = await streamAndUpload(req);
        console.log('Upload result with form data:', uploadResult);

        const { userId, text, imageUrl, videoUrl, postType } = uploadResult;
        
        if ((!imageUrl && !videoUrl) || !userId || !text) {
            return res.status(400).json({ 
                error: "Missing required fields",
                received: { imageUrl: !!imageUrl, videoUrl: !!videoUrl, userId: !!userId, text: !!text }
            });
        }

        const post = await Post.create({
            user: userId,
            imageUrl,
            videoUrl,
            postType,
            text
        });

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'username')
            .populate('comments.user', 'username');

        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(400).json({ error: error.message || "Error creating post" });
    }
});

app.get("/feed/:userId", async (req, res) => {
    try {
        // Get the current user with their following list
        const currentUser = await User.findById(req.params.userId)
            .populate('following', '_id');
        
        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get all posts
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate('user', 'username')
            .populate('comments.user', 'username');

        // Add isFollowing flag to each post
        const postsWithFollowingStatus = posts.map(post => {
            const postObject = post.toObject();
            postObject.isFollowing = currentUser.following.some(f => f._id.toString() === post.user._id.toString());
            return postObject;
        });

        // Sort posts: followed users first, then others
        const sortedPosts = postsWithFollowingStatus.sort((a, b) => {
            if (a.isFollowing && !b.isFollowing) return -1;
            if (!a.isFollowing && b.isFollowing) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json(sortedPosts);
    } catch (error) {
        console.error('Error loading feed:', error);
        res.status(400).json({ error: error.message });
    }
});

// Follow routes
app.post("/follow-request/:userId", async (req, res) => {
    try {
        const { targetUserId } = req.body;
        
        // Validate both users exist
        const [requesterUser, targetUser] = await Promise.all([
            User.findById(req.params.userId),
            User.findById(targetUserId)
        ]);

        if (!targetUser || !requesterUser) {
            return res.status(404).json({ error: "One or both users not found" });
        }

        // Check if already following or request pending
        if (targetUser.followers.includes(req.params.userId) || 
            targetUser.pendingFollowRequests.includes(req.params.userId)) {
            return res.status(400).json({ error: "Follow request already sent or already following" });
        }

        // Add pending request to the target user
        await User.findByIdAndUpdate(targetUserId, {
            $addToSet: { pendingFollowRequests: req.params.userId }
        });

        // Create notification for the target user
        await Notification.create({
            recipient: targetUserId,
            sender: req.params.userId,
            type: 'follow_request'
        });

        // Return updated target user data
        const updatedTargetUser = await User.findById(targetUserId)
            .populate('followers', 'username')
            .populate('following', 'username');

        res.json({ 
            message: 'Follow request sent',
            user: updatedTargetUser
        });
    } catch (error) {
        console.error('Error sending follow request:', error);
        res.status(400).json({ error: error.message });
    }
});

app.post("/accept-follow/:userId", async (req, res) => {
    try {
        const { requesterId, notificationId } = req.body;
        const receiverId = req.params.userId;

        console.log(`ACCEPT FOLLOW: receiverId=${receiverId}, requesterId=${requesterId}`);

        // Update both users atomically
        const [receiverUser, requesterUser] = await Promise.all([
            User.findByIdAndUpdate(receiverId, {
                $pull: { pendingFollowRequests: requesterId },
                $addToSet: { followers: requesterId }
            }, { new: true }),
            User.findByIdAndUpdate(requesterId, {
                $addToSet: { following: receiverId }
            }, { new: true })
        ]);

        if (!receiverUser || !requesterUser) {
            console.error('Could not find one or both users after update.');
            return res.status(404).json({ error: "User update failed, one or both users not found." });
        }

        console.log('Users updated successfully.');

        // Delete the follow request notification
        if (notificationId) {
            await Notification.findByIdAndDelete(notificationId);
        }

        // Create notification for the requester
        await Notification.create({
            recipient: requesterId,
            sender: receiverId,
            type: 'follow_accept'
        });

        console.log('Notification created for follow acceptance.');

        res.json({ message: 'Follow request accepted' });
    } catch (error) {
        console.error('Error accepting follow request:', error);
        res.status(400).json({ error: error.message });
    }
});

// Decline follow request
app.post("/decline-follow/:userId", async (req, res) => {
    try {
        const { requesterId, notificationId } = req.body;
        // Remove from pending follow requests
        await User.findByIdAndUpdate(req.params.userId, {
            $pull: { pendingFollowRequests: requesterId }
        });

        // Delete the follow request notification
        if (notificationId) {
            await Notification.findByIdAndDelete(notificationId);
        }

        res.json({ message: 'Follow request declined' });
    } catch (error) {
        console.error('Error declining follow request:', error);
        res.status(400).json({ error: error.message });
    }
});

// Like and Comment routes
app.post("/posts/:postId/like", async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );
        await Notification.create({
            recipient: post.user,
            sender: userId,
            type: 'like',
            post: post._id
        });
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/posts/:postId/comment", async (req, res) => {
    try {
        const { userId, text } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $push: { comments: { user: userId, text } } },
            { new: true }
        );
        await Notification.create({
            recipient: post.user,
            sender: userId,
            type: 'comment',
            post: post._id
        });
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Notification routes
app.get("/notifications/:userId", async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('post');
        res.json(notifications);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unfollow route
app.post("/unfollow/:userId", async (req, res) => {
    try {
        const { targetUserId } = req.body;
        
        // Remove follower from target user's followers
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: req.params.userId }
        });

        // Remove target from user's following
        await User.findByIdAndUpdate(req.params.userId, {
            $pull: { following: targetUserId }
        });

        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete post
app.delete("/posts/:postId", async (req, res) => {
    try {
        // Get the post to find the image URL
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if the user is the owner of the post
        if (post.user.toString() !== req.query.userId) {
            return res.status(403).json({ error: "Not authorized to delete this post" });
        }

        try {
            // Extract public_id from Cloudinary URL
            const urlParts = post.imageUrl.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = `uploaded_files/${publicIdWithExtension.split('.')[0]}`;
            
            // Delete image from Cloudinary
            await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with post deletion even if Cloudinary delete fails
        }

        // Delete post from database
        await Post.findByIdAndDelete(req.params.postId);

        // Delete all notifications related to this post
        await Notification.deleteMany({ post: req.params.postId });

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete notification
app.delete("/notifications/:notificationId", async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.notificationId);
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

 