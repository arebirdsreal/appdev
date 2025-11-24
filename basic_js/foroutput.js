// crud-menu.js
// Run with: node crud-menu.js

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// Our in-memory "database"
let items = ["Alpha", "Bravo", "Charlie"];

function showItems() {
  if (items.length === 0) {
    console.log("\n[Empty]\n");
    return;
  }
  console.log("\nCurrent Items:");
  items.forEach((v, i) => console.log(`  ${i}: ${v}`));
  console.log();
}

function isValidIndex(idx) {
  return Number.isInteger(idx) && idx >= 0 && idx < items.length;
}

async function createItem() {
  const value = (await ask("Enter new item value: ")).trim();
  if (!value) {
    console.log("⚠️  Value cannot be empty.\n");
    return;
  }
  // Optional: choose where to insert
  const where = (await ask("Append at end? (y/N) ")).trim().toLowerCase();
  if (where === "y") {
    items.push(value);
    console.log("✅ Added at end.\n");
  } else {
    const raw = await ask(
      `Insert at index (0 to ${items.length}): `
    );
    const idx = Number(raw);
    if (Number.isInteger(idx) && idx >= 0 && idx <= items.length) {
      items.splice(idx, 0, value);
      console.log(`✅ Inserted at index ${idx}.\n`);
    } else {
      console.log("⚠️  Invalid index. Canceled.\n");
    }
  }
}

async function readItems() {
  showItems();
}

async function updateItem() {
  if (items.length === 0) {
    console.log("⚠️  Nothing to update.\n");
    return;
  }
  showItems();
  const raw = await ask(`Enter index to update (0 to ${items.length - 1}): `);
  const idx = Number(raw);
  if (!isValidIndex(idx)) {
    console.log("⚠️  Invalid index.\n");
    return;
  }
  const newVal = (await ask("Enter new value: ")).trim();
  if (!newVal) {
    console.log("⚠️  Value cannot be empty.\n");
    return;
  }
  const old = items[idx];
  items[idx] = newVal;
  console.log(`✅ Updated index ${idx}: "${old}" → "${newVal}"\n`);
}

async function deleteItem() {
  if (items.length === 0) {
    console.log("⚠️  Nothing to delete.\n");
    return;
  }
  showItems();
  const raw = await ask(`Enter index to delete (0 to ${items.length - 1}): `);
  const idx = Number(raw);
  if (!isValidIndex(idx)) {
    console.log("⚠️  Invalid index.\n");
    return;
  }
  const removed = items.splice(idx, 1)[0];
  console.log(`🗑️  Deleted "${removed}" at index ${idx}.\n`);
}

async function searchItems() {
  if (items.length === 0) {
    console.log("⚠️  Nothing to search.\n");
    return;
  }
  const term = (await ask("Enter search term: ")).trim().toLowerCase();
  if (!term) {
    console.log("⚠️  Search term cannot be empty.\n");
    return;
  }
  const matches = items
    .map((v, i) => ({ i, v }))
    .filter(({ v }) => v.toLowerCase().includes(term));

  if (matches.length === 0) {
    console.log("🔍 No matches.\n");
  } else {
    console.log("🔍 Matches:");
    matches.forEach(({ i, v }) => console.log(`  ${i}: ${v}`));
    console.log();
  }
}

async function clearItems() {
  const confirm = (await ask("Are you sure you want to clear all items? (type YES): ")).trim();
  if (confirm === "YES") {
    items = [];
    console.log("🧹 Cleared all items.\n");
  } else {
    console.log("Canceled.\n");
  }
}

async function showMenu() {
  console.log("==== Array CRUD Menu ====");
  console.log("1) Create (Add/Insert)");
  console.log("2) Read (List)");
  console.log("3) Update (by index)");
  console.log("4) Delete (by index)");
  console.log("5) Search");
  console.log("6) Clear All");
  console.log("0) Exit");
  const choice = await ask("Choose an option: ");
  return choice.trim();
}

async function main() {
  console.log("\nWelcome! Starting with sample items: [\"Alpha\", \"Bravo\", \"Charlie\"]\n");
  while (true) {
    try {
      const choice = await showMenu();
      console.log();
      switch (choice) {
        case "1":
          await createItem();
          break;
        case "2":
          await readItems();
          break;
        case "3":
          await updateItem();
          break;
        case "4":
          await deleteItem();
          break;
        case "5":
          await searchItems();
          break;
        case "6":
          await clearItems();
          break;
        case "0":
          console.log("Goodbye!");
          rl.close();
          return;
        default:
          console.log("⚠️  Invalid choice. Try again.\n");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }
}

main();
