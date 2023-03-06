function validatePetCreateData(data) {
    const { z } = require("zod");
    const petNameZchema = z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be of text type",
    })
    .max(255, "Length must be up to 255 characters");
  const petSizeZchema = z.enum(["small", "medium", "big", "giant"]);

  const petZchema = z.object({
    name: petNameZchema,
    size: petSizeZchema,
  });

  const petParseResult = petZchema.safeParse(data);

  return petParseResult;
}

function validatePetUpdateData(data) {
    const { z } = require("zod");
        const petNameZchema = z
        .string({
            invalid_type_error: "Name must be of text type",
        })
        .max(255, "Length must be up to 255 characters")
        .optional();
    const petSizeZchema = z.enum(["small", "medium", "big", "giant"]).optional();

    const petZchema = z.object({
        name: petNameZchema,
        size: petSizeZchema,
    });

    const petParseResult = petZchema.safeParse(data);

    return petParseResult;
}

module.exports = {
    validatePetCreateData,
    validatePetUpdateData,
};