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
    const { name, category, deviceCode, image } = req.body;

    const newResource = new Resource({
      name,
      category,
      status: 'AVAILABLE',
      deviceCode: deviceCode?.trim() ? deviceCode.trim() : undefined, // To avoid empty string violating unique sparse index
      image: image?.trim() ? image.trim() : undefined
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
    const { name, category, deviceCode, image } = req.body;

    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
      return res.status(400).json({ message: 'Manual status updates are not allowed' });
    }

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.status === 'BORROWED') {
      return res.status(400).json({ message: 'Cannot update a borrowed resource' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      resource.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'category')) {
      resource.category = category;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'deviceCode')) {
      resource.deviceCode = deviceCode?.trim() ? deviceCode.trim() : undefined;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'image')) {
      resource.image = image?.trim() ? image.trim() : undefined;
    }

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
