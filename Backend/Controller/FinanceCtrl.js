import Order from "../Models/OrderModel.js";

// ================= HELPER: Classify Payment Method =================
const isOnlinePayment = (method) => {
  return ["RAZORPAY", "CARD", "ONLINE"].includes((method || "").toUpperCase());
};

const isCODPayment = (method) => {
  return (method || "").toUpperCase() === "COD";
};

// ================= GET FINANCE SUMMARY =================
export const getFinanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(dateFilter);

    // =========== INCOME CALCULATION ===========
    // Rule 1: COD Income — ONLY when orderStatus = "delivered" AND NOT cancelled/returned
    // Rule 2: Online Income — ONLY when paymentStatus = "Paid" AND order NOT cancelled/returned

    let totalIncomeCOD = 0;
    let totalIncomeOnline = 0;
    let pendingIncome = 0;
    let totalRefundAmount = 0;
    let cancelledOrdersAmount = 0;
    let returnedOrdersAmount = 0;
    let totalShippingCollected = 0;
    let totalCodChargesCollected = 0;

    let deliveredCount = 0;
    let cancelledCount = 0;
    let returnedCount = 0;
    let pendingCount = 0;

    for (const order of orders) {
      const method = (order.paymentMethod || "").toUpperCase();
      const payStatus = order.paymentStatus;
      const orderStatus = order.orderStatus;
      const grand = order.grandTotal || 0;
      const shipping = order.shippingAmount || 0;
      const codCharge = order.codCharge || 0;

      // Check if order has been cancelled or returned (approved)
      const isCancelled = orderStatus === "cancelled" && order.cancelApprovedByAdmin === true;
      const isReturned = orderStatus === "cancelled" && order.returnApprovedByAdmin === true;
      const isCancelledOrReturned = isCancelled || isReturned;

      // ---- COUNT CANCELLED vs RETURNED ----
      if (isReturned) {
        returnedCount++;
        returnedOrdersAmount += grand;
      } else if (isCancelled) {
        cancelledCount++;
        cancelledOrdersAmount += grand;
      }
      // Also count user-initiated cancels without admin action as cancelled
      else if (orderStatus === "cancelled") {
        cancelledCount++;
        cancelledOrdersAmount += grand;
      }

      // ---- INCOME LOGIC ----
      if (isCODPayment(method)) {
        // COD: income ONLY when delivered and NOT cancelled/returned
        if (orderStatus === "delivered" && !isCancelledOrReturned) {
          totalIncomeCOD += grand;
          totalShippingCollected += shipping;
          totalCodChargesCollected += codCharge;
          deliveredCount++;
        }
        // COD: pending = orders not yet delivered and not cancelled
        else if (!isCancelledOrReturned && orderStatus !== "cancelled") {
          pendingIncome += grand;
          pendingCount++;
        }
      } else if (isOnlinePayment(method)) {
        // Online: income ONLY when payment is "Paid"
        if (payStatus === "Paid") {
          if (isCancelledOrReturned) {
            // Already paid but now cancelled/returned → REFUND territory
            // refundAmount is already set in order model
            totalRefundAmount += (order.refundAmount || grand);
          } else {
            // Paid and not cancelled → actual income
            totalIncomeOnline += grand;
            totalShippingCollected += shipping;

            if (orderStatus === "delivered") {
              deliveredCount++;
            }
          }
        }
        // Online: pending = payment status is "Pending"
        else if (payStatus === "Pending" && orderStatus !== "cancelled") {
          pendingIncome += grand;
          pendingCount++;
        }
      }
    }

    // Also count refunds from orders with refundStatus = "Processing" or "Completed"
    // that might not have been captured above (e.g. COD returns where admin manually refunds)
    const pendingRefunds = orders.filter(o =>
      o.refundStatus === "Processing"
    );
    const completedRefunds = orders.filter(o =>
      o.refundStatus === "Completed"
    );

    const totalIncome = totalIncomeCOD + totalIncomeOnline;

    res.json({
      success: true,
      summary: {
        totalIncome: Math.round(totalIncome),
        totalIncomeCOD: Math.round(totalIncomeCOD),
        totalIncomeOnline: Math.round(totalIncomeOnline),
        pendingIncome: Math.round(pendingIncome),
        totalRefundAmount: Math.round(totalRefundAmount),
        cancelledOrdersAmount: Math.round(cancelledOrdersAmount),
        returnedOrdersAmount: Math.round(returnedOrdersAmount),
        totalShippingCollected: Math.round(totalShippingCollected),
        totalCodChargesCollected: Math.round(totalCodChargesCollected),
        totalOrders: orders.length,
        deliveredCount,
        cancelledCount,
        returnedCount,
        pendingCount,
        pendingRefundsCount: pendingRefunds.length,
        completedRefundsCount: completedRefunds.length,
      }
    });

  } catch (error) {
    console.error("Finance Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET FINANCE TRANSACTIONS =================
export const getFinanceTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      paymentMethod,
      orderStatus,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build query filter
    let filter = {};

    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod.toUpperCase();
    }

    if (orderStatus && orderStatus !== "all") {
      filter.orderStatus = orderStatus.toLowerCase();
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Search by orderId or user name
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Map to finance-friendly format
    const transactions = orders.map((order) => {
      const method = (order.paymentMethod || "").toUpperCase();
      const isRefundable =
        isOnlinePayment(method) &&
        order.paymentStatus === "Paid" &&
        (order.cancelApprovedByAdmin === true || order.returnApprovedByAdmin === true);

      return {
        _id: order._id,
        orderId: order.orderId,
        userName: order.userId?.fullName || order.shippingAddress?.name || "N/A",
        userEmail: order.userId?.email || order.shippingAddress?.email || "",
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        shippingAmount: order.shippingAmount || 0,
        codCharge: order.codCharge || 0,
        grandTotal: order.grandTotal,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        refundAmount: order.refundAmount || 0,
        refundStatus: order.refundStatus,
        isCancelled: order.cancelApprovedByAdmin === true,
        isReturned: order.returnApprovedByAdmin === true,
        createdAt: order.createdAt,
      };
    });

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });

  } catch (error) {
    console.error("Finance Transactions Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
