import express from "express";
import { getFinanceSummary, getFinanceTransactions } from "../Controller/FinanceCtrl.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// GET /api/v1/admin/finance/summary
router.get("/summary", AuthMiddleware, isAdmin, getFinanceSummary);

// GET /api/v1/admin/finance/transactions
router.get("/transactions", AuthMiddleware, isAdmin, getFinanceTransactions);

export default router;
