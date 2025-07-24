import express  from "express";
import { getTenant, createTenant, updateTenant, getCurrentResidences } from "../controllers/tenantController";


const router = express.Router();

router.get("/:cognitoId", getTenant);
router.get("/:cognitoId/current-residences", getCurrentResidences);
router.post("/", createTenant);
router.put("/:cognitoId", updateTenant); // Assuming update is the same as create for simplicity


export default router;