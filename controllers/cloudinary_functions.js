import {v2 as cloudinary} from 'cloudinary';
import dotenv from "dotenv";
import busboy from 'busboy';


dotenv.config();


//config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const streamAndUpload = (req) => {
    return new Promise((resolve, reject) => {
        try {
            const contentType = req.headers["content-type"];
            if (!contentType || !contentType.includes("multipart/form-data")) {
                reject("Unsupported content type");
                return;
            }

            const bb = busboy({ headers: req.headers });
            let uploadPromise = null;
            const formData = {};

            bb.on("file", (name, stream, info) => {
                const { filename, mimeType } = info;
                console.log(`Uploading file: ${filename} with type: ${mimeType}`);

                uploadPromise = new Promise((resolveUpload, rejectUpload) => {
                    const uploadStream = cloudinary.uploader.upload_stream({
                        folder: "uploaded_files",
                        resource_type: "auto",
                    }, (error, result) => {
                        if (error) {
                            console.error("Cloudinary upload error:", error);
                            rejectUpload(error);
                            return;
                        }
                        console.log("Upload result:", result);
                        resolveUpload({ url: result.secure_url, resource_type: result.resource_type });
                    });

                    stream.pipe(uploadStream);
                });
            });

            bb.on("field", (name, val) => {
                formData[name] = val;
            });

            bb.on("finish", async () => {
                console.log("File upload process completed");
                try {
                    if (!uploadPromise) {
                        reject("No file uploaded");
                        return;
                    }
                    const uploadResult = await uploadPromise;
                    
                    const postData = { ...formData };
                    if (uploadResult.resource_type === 'video') {
                        postData.videoUrl = uploadResult.url;
                        postData.postType = 'video';
                    } else {
                        postData.imageUrl = uploadResult.url;
                        postData.postType = 'image';
                    }

                    resolve(postData);
                } catch (error) {
                    reject(error);
                }
            });

            bb.on("error", (error) => {
                console.error("Busboy error:", error);
                reject(error);
            });

            req.pipe(bb);
        } catch (error) {
            console.error("Upload error:", error);
            reject(error);
        }
    });
};
 