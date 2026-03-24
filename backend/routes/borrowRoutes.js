import express from 'express';
import { createBorrowRequest, getBorrowRequests } from '../controllers/borrowController.js';

const router = express.Router();

// POST /api/requests
router.post('/', createBorrowRequest);

// GET /api/requests
// Handles both all requests and filtering (e.g., ?status=PENDING)
router.get('/', getBorrowRequests);

export default router;
