const cloudinary = require("../config/cloudiary");

function uploadImage(buffer, folder = "campusbookhub/books") {
    return new Promise((resolve, reject) => {

        if (!buffer) {
            return reject(new Error("Image buffer is missing"));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {

                if (error) {
                    return reject(error);
                }

                if (!result || !result.secure_url) {
                    return reject(
                        new Error("Cloudinary image URL not received")
                    );
                }

                resolve(result.secure_url);
            }
        );

        uploadStream.on("error", reject);

        uploadStream.end(buffer);
    });
}

module.exports = uploadImage;