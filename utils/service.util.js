function validateServiceCreateData(data) {
    const { z } = require("zod");
    const serviceNameZchema = z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be of text type",
        })
        .max(255, "Length must be up to 255 characters");
  const serviceDescriptionZchema = z
        .string({
            required_error: "Description is required",
            invalid_type_error: "Description must be of text type",
        })
        .max(255, "Length must be up to 255 characters");
    const servicePriceZchema = z
        .number({
            required_error: "Price is required",
            invalid_type_error: "Price must be a number",
        })
        .gte(0.01);

  const serviceZchema = z.object({
    name: serviceNameZchema,
    description: serviceDescriptionZchema,
    price: servicePriceZchema,
  });

  const serviceParseResult = serviceZchema.safeParse(data);

  return serviceParseResult;
}

module.exports = {
    validateServiceCreateData,
};