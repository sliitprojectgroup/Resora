import express from 'express';
import { createBorrowRequest, getBorrowRequests, approveRequest } from '../controllers/borrowController.js';

const router = express.Router();

// POST /api/requests
router.post('/', createBorrowRequest);

// GET /api/requests
// Handles both all requests and filtering (e.g., ?status=PENDING)
router.get('/', getBorrowRequests);

// PATCH /api/requests/:id/approve
router.patch('/:id/approve', approveRequest);

export default router;
