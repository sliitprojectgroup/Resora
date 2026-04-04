import BorrowRequest from '../models/BorrowRequest.js';
import Resource from '../models/Resource.js';

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
      .populate('student', 'name role studentId')
      .populate('resource', 'name status');

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching borrow requests', error: error.message });
  }
};

// 4. Approve Borrow Request
// PUT /api/requests/:id/approve
export const approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await BorrowRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }
    
    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Request is not pending' });
    }
    
    const resource = await Resource.findById(request.resource);
    
    if (!resource || resource.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Resource is not available' });
    }
    
    const now = new Date();
    
    // Set due date to exactly 7 days from the moment of approval
    request.dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    request.status = 'APPROVED';
    await request.save();
    
    resource.status = 'BORROWED';
    await resource.save();
    
    return res.status(200).json({ message: 'Request approved successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error approving request', error: error.message });
  }
};

// 5. Reject Borrow Request
// PATCH /api/requests/:id/reject
export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const request = await BorrowRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'REJECTED';
    request.rejectionReason = rejectionReason;
    await request.save();

    return res.status(200).json({ message: 'Request rejected successfully', request });
  } catch (error) {
    return res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};

// 6. Return Resource
// PATCH /api/requests/:id/return
export const returnResource = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { deviceCondition, returnNotes } = req.body;
    const request = await BorrowRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (request.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Request must be APPROVED to be returned' });
    }

    const now = new Date();
    request.returnDate = now;
    request.status = 'RETURNED';
    
    // Save device condition and notes
    if (deviceCondition) {
      request.deviceCondition = deviceCondition;
    }
    if (returnNotes) {
      request.returnNotes = returnNotes;
    }

    if (now > request.dueDate) {
      const daysLate = Math.floor(
        (now - request.dueDate) / (1000 * 60 * 60 * 24)
      );
      request.daysLate = daysLate;
      request.penaltyAmount = daysLate * 50;
    } else {
      request.daysLate = 0;
      request.penaltyAmount = 0;
    }
    
    await request.save();

    const resource = await Resource.findById(request.resource);
    if (resource) {
      resource.status = 'AVAILABLE';
      await resource.save();
    }

    return res.status(200).json({ 
      message: 'Resource returned successfully', 
      daysLate: request.daysLate,
      penaltyAmount: request.penaltyAmount,
      request 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error returning resource', error: error.message });
  }
};

// 7. Get Overdue Requests
// GET /api/requests/overdue
export const getOverdueRequests = async (req, res) => {
  try {
    const overdueRequests = await BorrowRequest.find({
      status: 'APPROVED',
      dueDate: { $lt: new Date() }
    })
    .populate('student', 'name role studentId')
    .populate('resource', 'name status');

    return res.status(200).json(overdueRequests);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching overdue requests', error: error.message });
  }
};

// 8. Get Borrowed Items
export const getBorrowedItems = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ status: 'APPROVED' })
      .populate('student', 'name role studentId')
      .populate('resource', 'name status');
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching borrowed items', error: error.message });
  }
};

// 9. Get Single Request by ID (used by QR scanner to check overdue status)
// GET /api/requests/:id
export const getRequestById = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id)
      .populate('student', 'name role studentId')
      .populate('resource', 'name status');

    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching request', error: error.message });
  }
};