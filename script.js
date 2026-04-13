<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
const SUPABASE_URL = "https://bzwnjtofcduxllafdybw.supabase.co";
const SUPABASE_KEY = "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl";

const supabaseClient = supabase.createClient("https://bzwnjtofcduxllafdybw.supabase.co", "sb_publishable_oFhZq2o2Ao5800xY2xzhFw_WOgTUHUl");

/* RESET */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* GLOBAL */
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #0f172a, #020617);
  color: #e2e8f0;
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 70px 1fr;
  height: 100vh;
}

/* HEADER */
header {
  grid-column: 1 / span 2;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

/* LOGO */
.logo {
  cursor: pointer;
}

/* SIDEBAR */
aside {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  padding: 15px;
}

aside ul {
  list-style: none;
}

aside li {
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;
  transition: 0.3s;
}

aside li:hover {
  background: rgba(255,255,255,0.1);
  transform: translateX(5px);
}

/* MAIN */
main {
  padding: 25px;
  background-size: cover;
}

/* CARD UI */
.card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.08);
}

/* INPUTS */
input, textarea {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,0.05);
  color: white;
}

/* BUTTONS */
button {
  margin-top: 10px;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  transform: scale(1.05);
}

/* TABLE */
table {
  width: 100%;
  margin-top: 15px;
}

td, th {
  padding: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

/* PAGE SWITCH */
.page {
  display: none;
}

.page.active {
  display: block;
}

/* SCROLLBAR */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(#6366f1, #22d3ee);
  border-radius: 10px;
}
  
  

 
