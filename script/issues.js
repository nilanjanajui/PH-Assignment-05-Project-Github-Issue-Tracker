const issuesContainer = document.getElementById("issuesContainer");
const issueCount = document.getElementById("issueCount");

let allIssues = [];

const overlay = document.getElementById("loadingOverlay");


function showLoading() {
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
}

function hideLoading() {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
}

async function loadIssues() {

    try {
        showLoading();

        const res = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
        const result = await res.json();

        allIssues = result.data;

        displayIssues(allIssues);

    } catch (error) {
        console.log("Error loading issues:", error);
    } finally {
        hideLoading();
    }
}

function displayIssues(issues) {
    issuesContainer.innerHTML = "";
    issueCount.innerText = `${issues.length} Issues`;

    issues.forEach(issue => {
        const borderColor =
            issue.status === "open" ? "border-green-500" : "border-purple-500";

        const statusIcon =
            issue.status === "open"
                ? "./assets/Open-Status.png"
                : "./assets/Closed- Status .png";

        const priorityColor =
            issue.priority === "high"
                ? "bg-red-100 text-red-500"
                : issue.priority === "medium"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-200 text-gray-600";

        const labelsHTML = issue.labels.map(label => {
            if (label === "bug") return `<span class="text-red-500 text-xs flex items-center gap-1 border border-red-500 px-2 py-1 rounded"><i class="fa-solid fa-bug"></i> BUG</span>`;
            if (label === "help wanted") return `<span class="text-yellow-600 text-xs flex items-center gap-1 border border-yellow-600 px-2 py-1 rounded"><i class="fa-regular fa-circle-question"></i> HELP WANTED</span>`;
            if (label === "enhancement") return `<span class="text-green-600 text-xs flex items-center gap-1 border border-green-600 px-2 py-1 rounded"><i class="fa-solid fa-wand-magic-sparkles"></i> ENHANCEMENT</span>`;
            if (label === "documentation") return `<span class="text-blue-600 text-xs flex items-center gap-1 border border-blue-600 px-2 py-1 rounded"><i class="fa-solid fa-book"></i> DOCUMENTATION</span>`;
            return "";
        }).join("");

        const card = document.createElement("div");
        card.className = `bg-white rounded-lg shadow-sm border-t-4 ${borderColor} hover:shadow-lg transition cursor-pointer`;

        card.innerHTML = `
            <div class="p-4">
                <div class="flex justify-between items-center mb-3">
                    <img src="${statusIcon}" class="w-5 h-5">
                    <span class="text-xs px-3 py-1 rounded-full ${priorityColor}">${issue.priority.toUpperCase()}</span>
                </div>
                <h3 class="font-semibold text-gray-800 mb-2">${issue.title}</h3>
                <p class="text-sm text-gray-500 mb-4">${issue.description}</p>
                <div class="flex gap-2 mb-4 flex-wrap">${labelsHTML}</div>
            </div>
            <div class="border-t border-gray-300 px-4 py-3 text-xs text-gray-500">
                <p>#${issue.id} by ${issue.author}</p>
                <p>${new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
        `;

        // Add click listener to open modal
        card.addEventListener("click", () => openIssueModal(issue));

        issuesContainer.appendChild(card);
    });
}

loadIssues();

function setActiveTab(activeTab) {

    const tabs = ["allTab", "openTab", "closedTab"];

    tabs.forEach(id => {

        const tab = document.getElementById(id);

        tab.classList.remove("bg-[#4A00FF]", "text-white", "hover:bg-[#3a00cc]", "cursor-pointer");
        tab.classList.add("bg-gray-200", "text-gray-700", "hover:bg-gray-300", "cursor-pointer");

    });

    const selected = document.getElementById(activeTab);

    selected.classList.remove("bg-gray-200", "text-gray-700", "hover:bg-gray-300", "cursor-pointer");

    selected.classList.add("bg-[#4A00FF]", "text-white", "hover:bg-[#3a00cc]", "cursor-pointer");

}

async function filterWithLoading(filterFn, tabId) {

    try {
        showLoading();
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredIssues = filterFn();
        displayIssues(filteredIssues);
        setActiveTab(tabId);
    } catch (error) {
        console.log("Error filtering issues:", error);
    } finally {
        hideLoading();
    }
}


document.getElementById("allTab").addEventListener("click", () => {
    displayIssues(allIssues);
    setActiveTab("allTab");
});

document.getElementById("openTab").addEventListener("click", async () => {
    await filterWithLoading(
        () => allIssues.filter(issue => issue.status === "open"),
        "openTab"
    );
});

document.getElementById("closedTab").addEventListener("click", async () => {
    await filterWithLoading(
        () => allIssues.filter(issue => issue.status === "closed"),
        "closedTab"
    );
});





document.getElementById("searchBtn").addEventListener("click", async () => {

    const text = document.getElementById("searchInput").value.trim().toLowerCase();

    if (!text) {
        displayIssues(allIssues);
        return;
    }

    try {
        showLoading();

        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(text)}`);
        const data = await res.json();
        const apiIssues = data.data || [];

        const titleMatchedIssues = apiIssues.filter(issue =>
            issue.title.toLowerCase().includes(text)
        );

        displayIssues(titleMatchedIssues);
    } catch (error) {
        console.log("Error searching issues:", error);
        displayIssues([]);
    } finally {
        hideLoading();
    }

});




const issueModal = document.getElementById("issueModal");
const modalContent = document.getElementById("modalContent");
function getLabelBadge(label) {
    if (label === "bug") {
        return `<span class="text-red-500 text-xs flex items-center gap-1 border border-red-500 px-2 py-1 rounded-full"><i class="fa-solid fa-bug"></i> BUG</span>`;
    }

    if (label === "help wanted") {
        return `<span class="text-yellow-600 text-xs flex items-center gap-1 border border-yellow-500 px-2 py-1 rounded-full"><i class="fa-regular fa-circle-question"></i> HELP WANTED</span>`;
    }

    if (label === "enhancement") {
        return `<span class="text-green-600 text-xs flex items-center gap-1 border border-green-500 px-2 py-1 rounded-full"><i class="fa-solid fa-wand-magic-sparkles"></i> ENHANCEMENT</span>`;
    }

    if (label === "documentation") {
        return `<span class="text-blue-600 text-xs flex items-center gap-1 border border-blue-500 px-2 py-1 rounded-full"><i class="fa-solid fa-book"></i> DOCUMENTATION</span>`;
    }

    return `<span class="text-gray-600 text-xs border border-gray-300 px-2 py-1 rounded-full">${label.toUpperCase()}</span>`;
}

function openIssueModal(issue) {
    const statusClass = issue.status === "open"
        ? "bg-emerald-500 text-white"
        : "bg-purple-500 text-white";

    const priorityClass = issue.priority === "high"
        ? "bg-red-600 text-white"
        : issue.priority === "medium"
            ? "bg-yellow-500 text-white"
            : "bg-gray-500 text-white";

    modalContent.innerHTML = `
        <h2 class="text-4xl font-bold text-gray-800 mb-4">${issue.title}</h2>

        <div class="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
            <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">${issue.status.toUpperCase()}</span>
            <span>&bull;</span>
            <span>Opened by ${issue.author}</span>
            <span>&bull;</span>
            <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>

        <div class="flex gap-2 mb-8 flex-wrap">
            ${issue.labels.map(getLabelBadge).join("")}
        </div>

        <p class="text-2xl text-slate-600 mb-8">${issue.description}</p>

        <div class="bg-gray-100 rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p class="text-gray-500 mb-1">Assignee:</p>
                <p class="text-2xl font-semibold text-gray-800">${issue.author}</p>
            </div>

            <div>
                <p class="text-gray-500 mb-1">Priority:</p>
                <span class="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase ${priorityClass}">${issue.priority.toUpperCase()}</span>
            </div>
        </div>

        <div class="flex justify-end">
            <button id="modalCloseAction"
                class="bg-[#4A00FF] hover:bg-[#3a00cc] text-white px-8 py-3 rounded-md transition-colors cursor-pointer">
                Close
            </button>
        </div>
    `;

    const modalCloseAction = document.getElementById("modalCloseAction");
    if (modalCloseAction) {
        modalCloseAction.addEventListener("click", closeIssueModal);
    }

    issueModal.classList.remove("opacity-0", "pointer-events-none");
    issueModal.classList.add("opacity-100");
    issueModal.firstElementChild.classList.remove("scale-95");
    issueModal.firstElementChild.classList.add("scale-100");
}

function closeIssueModal() {
    issueModal.classList.remove("opacity-100");
    issueModal.classList.add("opacity-0", "pointer-events-none");
    issueModal.firstElementChild.classList.remove("scale-100");
    issueModal.firstElementChild.classList.add("scale-95");
}

// Close modal buttons / click outside
issueModal.addEventListener("click", e => {
    if (e.target === issueModal) closeIssueModal();
});