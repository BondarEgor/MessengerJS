export function validateFields(options) {
    return (req, res, next) => {
        const missingFields = Object.keys(options).reduce((acc, section) => {
            const missingInSection = options[section].filter(field => !req[section] || !req[section][field])
                .map(field => `${section}.${field}`)

            return acc.concat(missingInSection)
        }, [])

        if (missingFields.length > 0) {
            return res.status(404).json({
                error: `Missing fields: ${missingFields.join(', ')}`,
            });
        }

        next();
    };
}
