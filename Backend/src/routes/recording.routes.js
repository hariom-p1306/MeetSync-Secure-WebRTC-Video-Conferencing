import express from "express";

import {
  getRecordingUploadUrl,
  getRecordingDownloadUrl,
} from "../controllers/recording.controller.js";

const router = express.Router();

router.post("/upload-url", getRecordingUploadUrl);
router.post("/download-url", getRecordingDownloadUrl);

export default router;