import express  from "express";

import { authMiddleware } from "../middleware/authMiddleware";
import { createApplications, updateApplicationStatus, getApplications } from "../controllers/applicationControllers";
import { get } from "axios";


const router = express.Router();

router.post("/", authMiddleware(["tenant"]), createApplications);
router.put("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);
router.get("/", authMiddleware(["manager" ,"tenant"]), getApplications);





export default router;