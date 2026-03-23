import BorrowRequest from '../models/BorrowRequest.js';
import '../models/User.js';
import '../models/Resource.js';

// POST /api/requests — Create a new borrow request
export const createBorrowRequest = async (req, res) => {
  try {
    const { student, resource, dueDate } = req.body;

    const newRequest = await BorrowRequest.create({
      student,
      resource,
      dueDate,
      status: 'PENDING',
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create borrow request', error: error.message });
  }
};

// GET /api/requests — Get all borrow requests (with optional ?status= filter)
export const getBorrowRequests = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const requests = await BorrowRequest.find(filter)
      .populate('student', 'name role')
      .populate('resource', 'name status');

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch borrow requests', error: error.message });
  }
};
