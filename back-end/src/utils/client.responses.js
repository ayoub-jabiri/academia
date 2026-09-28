export const clientErrorResponse = (res, statusCode, msg) => {
    res.status(statusCode).json({
        message: msg,
    });
};

export const excludeUserPassword = (user) => {
    if (!user) {
        return null;
    }

    const { password, ...userWithoutPassword } = user?.toObject();

    return userWithoutPassword;
};
