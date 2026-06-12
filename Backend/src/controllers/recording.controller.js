import { generateUploadUrl, generateDownloadUrl } from "../utils/s3.js";

export const getRecordingUploadUrl = async (req, res) => {
  try {
    const { meetingCode, fileType } = req.body;

    if (!meetingCode || !fileType) {
      return res.status(400).json({
        success: false,
        message: "Meeting code and file type are required",
      });
    }

    const safeMeetingCode = meetingCode.replace(/[^a-zA-Z0-9-_]/g, "");
    const fileName = `recordings/${safeMeetingCode}/${Date.now()}.webm`;

    const uploadUrl = await generateUploadUrl({
      fileName,
      fileType,
    });

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return res.status(200).json({
      success: true,
      uploadUrl,
      fileUrl,
      fileName,
    });
 } catch (error) {
  console.error("S3 upload URL error:", error);
  console.error("AWS ENV CHECK:", {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    accessKeyExists: Boolean(process.env.AWS_ACCESS_KEY_ID),
    secretKeyExists: Boolean(process.env.AWS_SECRET_ACCESS_KEY),
  });

  return res.status(500).json({
    success: false,
    message: "Failed to generate recording upload URL",
  });
}
};

export const getRecordingDownloadUrl = async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    const downloadUrl = await generateDownloadUrl({ fileName });

    return res.status(200).json({
      success: true,
      downloadUrl,
    });
  } catch (error) {
    console.error("S3 download URL error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate recording download URL",
    });
  }
};