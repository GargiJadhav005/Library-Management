const db = require("./database");

const students = [
  { roll: 75,  name: "Gargi Jadhav",      balance: 498 },
  { roll: 76,  name: "Aarav Patel",        balance: 300 },
  { roll: 77,  name: "Isha Sharma",        balance: 150 },
  { roll: 78,  name: "Rohan Mehta",        balance: 220 },
  { roll: 79,  name: "Priya Deshmukh",     balance: 410 },
  { roll: 80,  name: "Karan Gupta",        balance: 560 },
  { roll: 81,  name: "Ananya Singh",       balance: 480 },
  { roll: 82,  name: "Devansh Joshi",      balance: 210 },
  { roll: 83,  name: "Meera Nair",         balance: 350 },
  { roll: 84,  name: "Riya Kapoor",        balance: 275 },
  { roll: 85,  name: "Sahil Agarwal",      balance: 505 },
  { roll: 86,  name: "Nisha Reddy",        balance: 400 },
  { roll: 87,  name: "Vikram Bansal",      balance: 295 },
  { roll: 88,  name: "Simran Kaur",        balance: 330 },
  { roll: 89,  name: "Tanmay Dey",         balance: 310 },
  { roll: 90,  name: "Sneha Chatterjee",   balance: 250 },
  { roll: 91,  name: "Ayaan Khan",         balance: 380 },
  { roll: 92,  name: "Ira Bhattacharya",   balance: 460 },
  { roll: 93,  name: "Manav Jain",         balance: 190 },
  { roll: 94,  name: "Diya Ghosh",         balance: 320 },
  { roll: 95,  name: "Ritvik Nanda",       balance: 280 },
  { roll: 96,  name: "Neha Chauhan",       balance: 260 },
  { roll: 97,  name: "Ishan Verma",        balance: 510 },
  { roll: 98,  name: "Tanya Mishra",       balance: 375 },
  { roll: 99,  name: "Aditya Rao",         balance: 440 },
  { roll: 100, name: "Mira Fernandes",     balance: 200 },
  { roll: 101, name: "Arnav Kulkarni",     balance: 415 },
  { roll: 102, name: "Rachita Tiwari",     balance: 345 },
  { roll: 103, name: "Kabir Desai",        balance: 285 },
  { roll: 104, name: "Aditi Pillai",       balance: 500 },
];

const books = [
  { title: "Hello World",                              author: "Author",                    isbn: "125455",          available: 0 },
  { title: "Clean Code",                               author: "Robert C. Martin",          isbn: "9780132350884",   available: 1 },
  { title: "The Pragmatic Programmer",                 author: "Andrew Hunt",               isbn: "9780201616224",   available: 0 },
  { title: "Deep Work",                                author: "Cal Newport",               isbn: "9781455586691",   available: 0 },
  { title: "The Art of Computer Programming",          author: "Donald Knuth",              isbn: "9780321751041",   available: 1 },
  { title: "Atomic Habits",                            author: "James Clear",               isbn: "9780735211292",   available: 0 },
  { title: "Introduction to Algorithms",               author: "Thomas H. Cormen",          isbn: "9780262033848",   available: 0 },
  { title: "Python Crash Course",                      author: "Eric Matthes",              isbn: "9781593276034",   available: 1 },
  { title: "Cracking the Coding Interview",            author: "Gayle Laakmann McDowell",   isbn: "9780984782857",   available: 0 },
  { title: "Design Patterns",                          author: "Erich Gamma",               isbn: "9780201633610",   available: 1 },
  { title: "Refactoring",                              author: "Martin Fowler",             isbn: "9780201485677",   available: 0 },
  { title: "The Clean Coder",                          author: "Robert C. Martin",          isbn: "9780137081073",   available: 0 },
  { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell",          isbn: "9780136042594",   available: 0 },
  { title: "Computer Networks",                        author: "Andrew S. Tanenbaum",       isbn: "9780132126953",   available: 1 },
  { title: "Operating System Concepts",                author: "Abraham Silberschatz",      isbn: "9781118063330",   available: 0 },
  { title: "Database System Concepts",                 author: "Abraham Silberschatz",      isbn: "9780078022159",   available: 0 },
  { title: "Code Complete",                            author: "Steve McConnell",           isbn: "9780735619678",   available: 1 },
  { title: "Soft Skills",                              author: "John Sonmez",               isbn: "9781617292392",   available: 0 },
  { title: "Rework",                                   author: "Jason Fried",               isbn: "9780307463746",   available: 0 },
  { title: "Machine Learning Yearning",                author: "Andrew Ng",                 isbn: "9781979853858",   available: 0 },
  { title: "Introduction to Machine Learning",         author: "Ethem Alpaydin",            isbn: "9780262028189",   available: 0 },
  { title: "The Mythical Man-Month",                   author: "Fred Brooks",               isbn: "9780201835953",   available: 1 },
  { title: "The Lean Startup",                         author: "Eric Ries",                 isbn: "9780307887894",   available: 0 },
  { title: "Hooked",                                   author: "Nir Eyal",                  isbn: "9781591847786",   available: 0 },
  { title: "Algorithms Unlocked",                      author: "Thomas Cormen",             isbn: "9780262518802",   available: 1 },
  { title: "Data Science from Scratch",                author: "Joel Grus",                 isbn: "9781491901427",   available: 0 },
  { title: "Artificial Intelligence Basics",           author: "Tom Taulli",                isbn: "9781484250273",   available: 0 },
  { title: "Think Python",                             author: "Allen B. Downey",           isbn: "9781491939369",   available: 1 },
  { title: "JavaScript: The Good Parts",               author: "Douglas Crockford",         isbn: "9780596517748",   available: 0 },
  { title: "You Don't Know JS",                        author: "Kyle Simpson",              isbn: "9781491904244",   available: 0 },
];

const issueRecords = [
  { studentRoll: 75,  bookIsbn: "125455",          status: "issued",   issueDate: "2025-07-10", returnDate: null },
  { studentRoll: 76,  bookIsbn: "9780132350884",   status: "returned", issueDate: "2025-06-01", returnDate: "2025-06-20" },
  { studentRoll: 76,  bookIsbn: "9780201616224",   status: "issued",   issueDate: "2025-07-05", returnDate: null },
  { studentRoll: 77,  bookIsbn: "9781455586691",   status: "issued",   issueDate: "2025-07-12", returnDate: null },
  { studentRoll: 78,  bookIsbn: "9780321751041",   status: "returned", issueDate: "2025-06-10", returnDate: "2025-07-01" },
  { studentRoll: 79,  bookIsbn: "9780735211292",   status: "issued",   issueDate: "2025-07-08", returnDate: null },
  { studentRoll: 80,  bookIsbn: "9780262033848",   status: "issued",   issueDate: "2025-07-03", returnDate: null },
  { studentRoll: 81,  bookIsbn: "9781593276034",   status: "returned", issueDate: "2025-05-20", returnDate: "2025-06-15" },
  { studentRoll: 82,  bookIsbn: "9780984782857",   status: "issued",   issueDate: "2025-07-14", returnDate: null },
  { studentRoll: 83,  bookIsbn: "9780201633610",   status: "returned", issueDate: "2025-06-05", returnDate: "2025-06-25" },
  { studentRoll: 83,  bookIsbn: "9780201485677",   status: "issued",   issueDate: "2025-07-09", returnDate: null },
  { studentRoll: 84,  bookIsbn: "9780137081073",   status: "issued",   issueDate: "2025-07-11", returnDate: null },
  { studentRoll: 85,  bookIsbn: "9780136042594",   status: "issued",   issueDate: "2025-07-06", returnDate: null },
  { studentRoll: 86,  bookIsbn: "9780132126953",   status: "returned", issueDate: "2025-06-12", returnDate: "2025-07-02" },
  { studentRoll: 87,  bookIsbn: "9781118063330",   status: "issued",   issueDate: "2025-07-07", returnDate: null },
  { studentRoll: 88,  bookIsbn: "9780078022159",   status: "issued",   issueDate: "2025-07-13", returnDate: null },
  { studentRoll: 89,  bookIsbn: "9780735619678",   status: "returned", issueDate: "2025-06-08", returnDate: "2025-06-28" },
  { studentRoll: 89,  bookIsbn: "9781617292392",   status: "issued",   issueDate: "2025-07-04", returnDate: null },
  { studentRoll: 90,  bookIsbn: "9780307463746",   status: "issued",   issueDate: "2025-07-15", returnDate: null },
  { studentRoll: 91,  bookIsbn: "9781979853858",   status: "issued",   issueDate: "2025-07-01", returnDate: null },
  { studentRoll: 92,  bookIsbn: "9780262028189",   status: "issued",   issueDate: "2025-07-02", returnDate: null },
  { studentRoll: 93,  bookIsbn: "9780201835953",   status: "returned", issueDate: "2025-06-15", returnDate: "2025-07-05" },
  { studentRoll: 94,  bookIsbn: "9780307887894",   status: "issued",   issueDate: "2025-07-16", returnDate: null },
  { studentRoll: 95,  bookIsbn: "9781591847786",   status: "issued",   issueDate: "2025-07-17", returnDate: null },
  { studentRoll: 96,  bookIsbn: "9780262518802",   status: "returned", issueDate: "2025-06-20", returnDate: "2025-07-10" },
  { studentRoll: 97,  bookIsbn: "9781491901427",   status: "issued",   issueDate: "2025-07-18", returnDate: null },
  { studentRoll: 98,  bookIsbn: "9781484250273",   status: "issued",   issueDate: "2025-07-19", returnDate: null },
  { studentRoll: 99,  bookIsbn: "9781491939369",   status: "returned", issueDate: "2025-06-22", returnDate: "2025-07-12" },
  { studentRoll: 100, bookIsbn: "9780596517748",   status: "issued",   issueDate: "2025-07-20", returnDate: null },
  { studentRoll: 101, bookIsbn: "9781491904244",   status: "issued",   issueDate: "2025-07-21", returnDate: null },
  { studentRoll: 102, bookIsbn: "9781491939369",   status: "returned", issueDate: "2025-06-25", returnDate: "2025-07-15" },
  { studentRoll: 103, bookIsbn: "9780262028189",   status: "issued",   issueDate: "2025-07-22", returnDate: null },
  { studentRoll: 104, bookIsbn: "9780201835953",   status: "issued",   issueDate: "2025-07-23", returnDate: null },
];

async function seed() {
  // Wait for DB to be ready
  await db.ready;

  const existing = db.prepare("SELECT COUNT(*) as c FROM students").get();
  if (existing && existing.c > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  const insertStudent = db.prepare("INSERT OR IGNORE INTO students (roll, name, balance) VALUES (?, ?, ?)");
  const insertBook    = db.prepare("INSERT OR IGNORE INTO books (title, author, isbn, available) VALUES (?, ?, ?, ?)");
  const insertIssue   = db.prepare(
    "INSERT INTO issues (student_roll, book_id, issue_date, return_date, status, fine) VALUES (?, ?, ?, ?, ?, 0)"
  );

  for (const s of students) {
    insertStudent.run(s.roll, s.name, s.balance);
  }
  for (const b of books) {
    insertBook.run(b.title, b.author, b.isbn, b.available);
  }
  for (const rec of issueRecords) {
    const book = db.prepare("SELECT id FROM books WHERE isbn = ?").get(rec.bookIsbn);
    if (!book) continue;
    insertIssue.run(rec.studentRoll, book.id, rec.issueDate, rec.returnDate, rec.status);
  }

  console.log("Database seeded successfully.");
}

module.exports = seed;
