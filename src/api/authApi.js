// Simulated server call. Real authentication is built in later weeks.

// Demo account: student e-mail as username, password demo123456.
const DEMO_USERNAME = "230408025@student.edu.tr";
const DEMO_PASSWORD = "demo123456";

export function login(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username.trim() === DEMO_USERNAME && password === DEMO_PASSWORD) {
        resolve({ username: DEMO_USERNAME });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 500);
  });
}
