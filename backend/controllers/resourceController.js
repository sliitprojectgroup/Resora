import Resource from '../models/Resource.js';

// Get all resources
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
};

// Create a new resource
export const createResource = async (req, res) => {
  try {
    const { name, category, deviceCode } = req.body;

    const newResource = new Resource({
      name,
      category,
      deviceCode: deviceCode || undefined // To avoid empty string violating unique sparse index
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource', error: error.message });
  }
};

// Update an existing resource
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, deviceCode } = req.body;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.status === 'BORROWED') {
      return res.status(400).json({ message: 'Cannot update a borrowed resource' });
    }

    resource.name = name || resource.name;
    resource.category = category || resource.category;
    resource.deviceCode = deviceCode || resource.deviceCode;

    const updatedResource = await resource.save();
    res.status(200).json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource', error: error.message });
  }
};

// Delete a resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.status === 'BORROWED') {
      return res.status(400).json({ message: 'Cannot delete a borrowed resource' });
    }

    await Resource.findByIdAndDelete(id);
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource', error: error.message });
  }
};
