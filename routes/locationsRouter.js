import express from "express";
import {
  searchLocations,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locationsController.js";

const locationsRouter = express.Router();

locationsRouter.get("/search", searchLocations);
locationsRouter.get("/", getAllLocations);
locationsRouter.get("/:id", getLocationById);
locationsRouter.post("/", createLocation);
locationsRouter.patch("/:id", updateLocation);
locationsRouter.delete("/:id", deleteLocation);

export default locationsRouter;
