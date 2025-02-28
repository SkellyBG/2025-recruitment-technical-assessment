import express, { Request, Response } from "express";
import { z } from "zod";
// ==== Type Definitions, feel free to add or modify ==========================
const recipeSchema = z.object({
  type: z.literal("recipe"),
  name: z.string(),
  requiredItems: z.array(
    z.object({ name: z.string(), quantity: z.number().gte(0) })
  ),
});

const ingredientSchema = z.object({
  type: z.literal("ingredient"),
  name: z.string(),
  cookTime: z.number().gte(0),
});

const cookbookEntrySchema = z.discriminatedUnion("type", [
  recipeSchema,
  ingredientSchema,
]);

type Recipe = z.infer<typeof recipeSchema>;
type Ingredient = z.infer<typeof ingredientSchema>;

type CookbookEntry = z.infer<typeof cookbookEntrySchema>;

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

type Cookbook = {
  recipes: Map<string, Recipe>;
  ingredients: Map<string, Ingredient>;
};

// Store your recipes here!
const cookbook: Cookbook = {
  recipes: new Map(),
  ingredients: new Map(),
};

// Task 1 helper (don't touch)
app.post("/parse", (req: Request, res: Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input);
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  }
  res.json({ msg: parsed_string });
  return;
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that
const parse_handwriting = (recipeName: string): string | null => {
  const recipeWords = recipeName
    .replace(/[-_]/g, " ") // replace all hyphens and underscores with whitespace
    .split(/\s+/) // split into individual words for processing
    .map((word) => word.replace(/[^a-zA-Z\d]/g, "")) // delete all non alphanumerical characters
    .filter((word) => word.length > 0) // filter all empty words
    .map(
      (word) =>
        word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()
    ); // transform them to titlecase

  return recipeWords.length ? recipeWords.join(" ") : null;
};

// [
//   "  Riz@z RISO00tto!",
//   "meatball   ",
//   "alpHa  aFREDO  ",
//   " A B c d",
//   " a-c-c-___d -_-c_CD",
//   " --- --- ",
// ].forEach((test) => console.log(parse_handwriting(test)));

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req: Request, res: Response) => {
  const parsedInput = cookbookEntrySchema.safeParse(req.body);

  if (!parsedInput.success) {
    res
      .status(400)
      .send(`Improperly formatted payload: ${parsedInput.error.message}`);
    return;
  }

  const cookbookEntry: CookbookEntry = parsedInput.data;

  if (
    cookbook.ingredients.has(cookbookEntry.name) ||
    cookbook.recipes.has(cookbookEntry.name)
  ) {
    res.status(400).send("An existing entry with the same name already exist.");
    return;
  }

  if (cookbookEntry.type === "recipe") {
    const requiredItemNames = cookbookEntry.requiredItems.map(
      (requiredItem) => requiredItem.name
    );

    if (new Set(requiredItemNames).size !== requiredItemNames.length) {
      res
        .status(400)
        .send(
          "Required items cannot have multiple elements with the same name."
        );

      return;
    }
  }

  switch (cookbookEntry.type) {
    case "recipe":
      cookbook.recipes.set(cookbookEntry.name, cookbookEntry);
      break;
    case "ingredient":
      cookbook.ingredients.set(cookbookEntry.name, cookbookEntry);
      break;
  }

  res.status(200).send("Cookbook Entry successfully added!");
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req: Request, res: Request) => {
  const input: unknown = req.query.name;

  if (typeof input !== "string") {
    res.status(400).send("Query parameter 'name' must be a string!");
    return;
  }

  const recipe = cookbook.recipes.find();

  // TODO: implement me
  res.status(500).send("not yet implemented!");
});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
