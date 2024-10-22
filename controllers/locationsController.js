import Location from "../models/locationModel.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";

export const searchLocations = ctrlWrapper(async (req, res) => {
  const { plz, city } = req.query;
  const query = {};

  if (plz) {
    query.plz = plz;
  }
  if (city) {
    query.city = { $regex: city, $options: "i" };
  }

  const locations = await Location.find(query);
  res.json(locations);
});

export const getAllLocations = ctrlWrapper(async (req, res) => {
  const locations = await Location.find();
  res.json(locations);
});

export const getLocationById = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const location = await Location.findById(id);

  if (!location) {
    throw HttpError(404, "Location not found");
  }

  res.json(location);
});

export const createLocation = ctrlWrapper(async (req, res) => {
  const newLocation = await Location.create(req.body);
  res.status(201).json(newLocation);
});

export const updateLocation = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const updatedLocation = await Location.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedLocation) {
    throw HttpError(404, "Location not found");
  }

  res.json(updatedLocation);
});

export const deleteLocation = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const deletedLocation = await Location.findByIdAndDelete(id);

  if (!deletedLocation) {
    throw HttpError(404, "Location not found");
  }

  res.status(204).json({ message: "Location deleted" });
});
