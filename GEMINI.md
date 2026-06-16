# FastFood - Database Schema & Project Context

## Firebase Database
The project connects to the Firebase project ID: `fastfood-6a333`.

### Collections

#### `platillos`
This collection stores the menu items (recipes/dishes) for the FastFood application.
*   **`nombre`** (`string`): The name of the dish (e.g., "Pizza Margarita").
*   **`ingredientes`** (`string`): A comma-separated list of ingredients.
*   **`precio`** (`number` / double): The price of the dish.

*Note: Use these specific field names when writing Firestore queries or creating/updating documents to maintain consistency.*