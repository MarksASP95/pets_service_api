function validateOwnerCreateData() {
    const { z } = require("zod");
    const ownerZchema = z.object({
        name: z.string({
            required_error: "Owner name is required",
            invalid_type_error: "Owner name must be of text type",
          })
          .max(255, "Owner name must be up to 255 characters"),
        phone: z.string({
            required_error: "Owner phone is required",
            invalid_type_error: "Owner phone must be of text type",
          })
          .max(20, "Owner name must be up to 20 characters"),
    });

    return ownerZchema.safeParse(owner.payload);
}

module.exports = {
    validateOwnerCreateData,
}