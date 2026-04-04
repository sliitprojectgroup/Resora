import express from 'express';
import { createBorrowRequest, getBorrowRequests, approveRequest, rejectRequest, returnResource, getOverdueRequests, getBorrowedItems, getRequestById } from '../controllers/borrowController.js';

const router = express.Router();

// POST /api/requests
router.post('/', createBorrowRequest);

// GET /api/requests/overdue  ← MUST be before /:id
router.get('/overdue', getOverdueRequests);

// GET /api/requests/borrowed  ← MUST be before /:id
router.get('/borrowed', getBorrowedItems);

// GET /api/requests
// Handles both all requests and filtering (e.g., ?status=PENDING)
router.get('/', getBorrowRequests);

// PATCH /api/requests/:id/approve
router.patch('/:id/approve', approveRequest);

// PATCH /api/requests/:id/reject
router.patch('/:id/reject', rejectRequest);

// PATCH /api/requests/:id/return
router.patch('/:id/return', returnResource);

// GET /api/requests/:id  ← MUST be last — catches any /:id
router.get('/:id', getRequestById);


export default router;
