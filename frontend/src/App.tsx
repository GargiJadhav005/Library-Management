import React, { useEffect, useState } from "react";

type Student = {
  roll: number;
  name: string;
  balance: number;
  booksIssued: string;
};

type Book = {
  title: string;
  author: string;
  isbn: number;
  available: boolean;
};

type LibraryData = {
  students: Student[];
  books: Book[];
};

export default function App() {
  const [data, setData] = useState<LibraryData>({ students: [], books: [] });
  const [role, setRole] = useState<string>(""); // Admin or Student
  const [roll, setRoll] = useState<number>(0);

  // Load JSON
  const loadData = async () => {
    const response = await fetch("/library.json");
    const json = await response.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!role) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Select Role</h2>
        <button onClick={() => setRole("Admin")}>Admin</button>
        <button onClick={() => setRole("Student")}>Student</button>
      </div>
    );
  }

  if (role === "Admin") {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Admin Panel</h2>
        <h3>Books</h3>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {data.books.map((b) => (
              <tr key={b.isbn}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.isbn}</td>
                <td>{b.available ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Students</h3>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th>Balance</th>
              <th>Books Issued</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => (
              <tr key={s.roll}>
                <td>{s.roll}</td>
                <td>{s.name}</td>
                <td>{s.balance}</td>
                <td>{s.booksIssued}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={loadData}>Refresh Data</button>
      </div>
    );
  }

  if (role === "Student") {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Student Panel</h2>
        <input
          type="number"
          placeholder="Enter your roll"
          value={roll || ""}
          onChange={(e) => setRoll(Number(e.target.value))}
        />
        <button onClick={loadData}>View Info</button>
        {roll ? (
          <div>
            {data.students
              .filter((s) => s.roll === roll)
              .map((s) => (
                <div key={s.roll}>
                  <h3>{s.name}</h3>
                  <p>Balance: {s.balance}</p>
                  <p>Books Issued: {s.booksIssued || "None"}</p>
                </div>
              ))}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
