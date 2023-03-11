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

function validateServiceRequestCreateData(data) {
    const { z } = require("zod");

    const serviceRequestZchema = z.object({
        petId: z.string({ required_error: "Pet ID is required" }),
        servicesIds: z.string().array(),
        total: z.number({ required_error: "Total is required" }).gte(0.01),
    });

    const serviceRequestParseResult = serviceRequestZchema.safeParse(data);

    return serviceRequestParseResult;
}

function validateServiceRequestStatus(status) {
    const { z } = require("zod");

    const newStatusZchema = z.enum(["due", "in_process", "done", "cancelled"]);

    return newStatusZchema.safeParse(status);
}

module.exports = {
    validateServiceCreateData,
    validateServiceRequestCreateData,
    validateServiceRequestStatus,
};