export function validateFields(options) {
    console.log('here')
    return (req, res, next) => {
        console.log('here')
        const missingFields = [];
        if (options.body) {
            options.body.forEach((field) => {
                if (!req.body[field]) {
                    missingFields.push(`body.${field}`);
                }
            });
        }

        if (options.query) {
            options.query.forEach((field) => {
                if (!req.query[field]) {
                    missingFields.push(`query.${field}`);
                }
            });
        }

        if (missingFields.length > 0) {
            return res.status(404).json({
                error: `Missing fields: ${missingFields.join(', ')}`,
            });
        }

        next();
    };
}
