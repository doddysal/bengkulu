// import { requireAuth } from "../core/guard.js";import { activeNav } from "../core/router.js";activeNav();requireAuth(["admin","super"]);
// import { requireClient,query } from "../core/api.js";Promise.all([query(requireClient().from("news").select("id",{count:"exact",head:true})),query(requireClient().from("volunteers").select("id",{count:"exact",head:true})),query(requireClient().from("events").select("id",{count:"exact",head:true}))]).then(([n,v,e])=>{document.querySelector("[data-stat-news]").textContent=n?.length??"-";document.querySelector("[data-stat-volunteers]").textContent=v?.length??"-";document.querySelector("[data-stat-events]").textContent=e?.length??"-";}).catch(console.error);
/**
 * =======================================================================
 * DASHBOARD CONTROLLER
 * =======================================================================
 */

// --- 1. Imports ---
import { requireAuth } from "../core/guard.js";
import { activeNav } from "../core/router.js";
import { requireClient, query } from "../core/api.js";


// --- 2. Security & Navigation Init ---
activeNav();
requireAuth(["admin", "super"]);


// --- 3. Dashboard Statistics Loader ---
Promise.all([
  query(requireClient().from("news").select("id", { count: "exact", head: true })),
  query(requireClient().from("volunteers").select("id", { count: "exact", head: true })),
  query(requireClient().from("events").select("id", { count: "exact", head: true }))
])
  .then(([newsStats, volunteerStats, eventStats]) => {
    
    // Inject data to DOM
    document.querySelector("[data-stat-news]").textContent       = newsStats?.length ?? "-";
    document.querySelector("[data-stat-volunteers]").textContent = volunteerStats?.length ?? "-";
    document.querySelector("[data-stat-events]").textContent     = eventStats?.length ?? "-";
    
  })
  .catch(console.error);