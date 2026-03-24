import BorrowRequest from '../models/BorrowRequest.js';

// 1. Create Borrow Request
// POST /api/requests
export const createBorrowRequest = async (req, res) => {
  try {
    const { student, resource, dueDate } = req.body;

    const newRequest = new BorrowRequest({
      student,
      resource,
      dueDate,
      status: 'PENDING' // Default status per requirements
    });

    const savedRequest = await newRequest.save();
    return res.status(201).json(savedRequest);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating borrow request', error: error.message });
  }
};

// 2. & 3. Get All Requests & Get Pending Requests
// GET /api/requests
// GET /api/requests?status=PENDING
export const getBorrowRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build filter dynamically based on query
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await BorrowRequest.find(filter)
      .populate('student', 'name role')
      .populate('resource', 'name status');

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching borrow requests', error: error.message });
  }
};
