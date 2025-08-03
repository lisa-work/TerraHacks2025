"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('Error:', err);
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { name: 'CastError', message, statusCode: 404 };
    }
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { name: 'DuplicateError', message, statusCode: 400 };
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {}).map((val) => val.message).join(', ');
        error = { name: 'ValidationError', message, statusCode: 400 };
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { name: 'JsonWebTokenError', message, statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { name: 'TokenExpiredError', message, statusCode: 401 };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map