var elemSelServer;
var elemDivSections;
var elemDivLogin;
var elemTextId;
var elemTextPass;
var elemImgId;
var elemImgPass;
var elemBtnLogin;
var elemDivOverview;
var elemDivLoginOK;
var elemDivLoginErr;
var elemDivJob;
var elemSelJob;
var elemDivGenTab;
var elemDivReport;
var elemDivBusy;
var elemBusyMsg;
var elemDivVariables;
var elemSelVariables;
var elemTop;
var elemSide;
var elemFilter;
var elemWeight;
var elemFormat;
var elemChkFreq;
var elemChkCol;
var elemChkRow;
var elemPreReport;
var elemDivHtml;
var elemSelTrees;
var elemInstruct;

let getOpts = null;
let postOpts = null;
let deleteOpts = null;
var infodata = null;
var logindata = null;
var jobdata = null;
var gentabdata = null;

// Event Handlers

function idChanged() {
    loginChanged();
}
// ══════════════════════════════════════════════════════════════════════
function passChanged() {
    loginChanged();
}
// ══════════════════════════════════════════════════════════════════════
function jobPickChanged() {
    openJob("Pick Change");
}
// ══════════════════════════════════════════════════════════════════════
function treePickChanged() {
    setActiveTree();
}
// ══════════════════════════════════════════════════════════════════════
async function loginClick() {
    if (logindata == null) {
        innerLogin();
    }
    else {
        await innerLogout();
    }
}
// ══════════════════════════════════════════════════════════════════════
function runClick() {
    genTab();
}
// ══════════════════════════════════════════════════════════════════════
function cellChecksChanged() {
    if (!elemChkFreq.checked && !elemChkCol.checked && !elemChkRow.checked) {
        elemChkFreq.checked = true;
    }
}
// ══════════════════════════════════════════════════════════════════════
function pageLoaded() {
    elemSelServer = document.getElementById("SelServer");
    elemDivSections = document.getElementById("DivSections");
    elemDivLogin = document.getElementById("DivLogin");
    elemTextId = document.getElementById("TextId");
    elemTextPass = document.getElementById("TextPass");
    elemImgId = document.getElementById("ImgId");
    elemImgPass = document.getElementById("ImgPass");
    elemBtnLogin = document.getElementById("BtnLogin");
    elemDivOverview = document.getElementById("DivOverview");
    elemDivLoginOK = document.getElementById("DivLoginOK");
    elemDivLoginErr = document.getElementById("DivLoginErr");
    elemDivJob = document.getElementById("DivJob");
    elemSelJob = document.getElementById("SelJob");
    elemDivGenTab = document.getElementById("DivGenTab");
    elemDivReport = document.getElementById("DivReport");
    elemDivBusy = document.getElementById("DivBusy");
    elemBusyMsg = document.getElementById("BusyMsg");
    elemDivVariables = document.getElementById("DivVariables");
    elemSelVariables = document.getElementById("SelVariables");
    elemTop = document.getElementById("TextTop");
    elemSide = document.getElementById("TextSide");
    elemFilter = document.getElementById("TextFilter");
    elemWeight = document.getElementById("TextWeight");
    elemFormat = document.getElementById("SelFormat");
    elemChkFreq = document.getElementById("CheckFreq");
    elemChkCol = document.getElementById("CheckCol");
    elemChkRow = document.getElementById("CheckRow");
    elemPreReport = document.getElementById("PreReport");
    elemDivHtml = document.getElementById("DivHtml");
    elemSelTrees = document.getElementById("SelTrees");
    elemInstruct = document.getElementById("DivInstruct");
    getInfo();
}
// ══════════════════════════════════════════════════════════════════════
function serviceChanged() {
    getInfo();
}
// ══════════════════════════════════════════════════════════════════════
function getInfo() {
    const url = `${elemSelServer.value}/service/info`;
    fetch(url)
        .then(async response => {
            if (response.status == 200) {
                infodata = await response.json();
                loginChanged();
                elemTextId.focus();
                elemDivLoginOK.hidden = false;
                elemDivLoginErr.hidden = true;
                elemDivLoginOK.innerHTML = `Connected to Carbon web service version ${infodata.version}. Carbon version ${infodata.carbonVersion}.`;
            }
            else {
                let errjson = await response.json();
                console.log(infodata);
                elemDivLoginOK.hidden = true;
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `Failed to retrieve service information from ${url} - ${errjson.message}`;
            }
        })
        .catch(error => {
            elemDivLoginOK.hidden = true;
            elemDivLoginErr.hidden = false;
            elemDivLoginErr.innerText = `Error retrieving service information from ${url} - ${error}`;
        });
}
// ══════════════════════════════════════════════════════════════════════
function innerLogin() {
    const loginReq = {
        name: elemTextId.value,
        password: elemTextPass.value,
        skipCache: false
    };
    const loginOpts = {
        method: "POST",
        body: JSON.stringify(loginReq),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    };
    showBusy(`Authentication credentials for Account id ${elemTextId.value}`);
    const url = `${elemSelServer.value}/session/start/authenticate/name`;
    fetch(url, loginOpts)
        .then(async response => {
            if (response.status == 200) {
                logindata = await response.json();
                console.log(logindata);
                getOpts = {
                    method: "GET",
                    headers: {
                        "x-session-id": logindata.sessionId
                    }
                };
                postOpts = {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "x-session-id": logindata.sessionId
                    }
                };
                deleteOpts = {
                    method: "DELETE",
                    headers: {
                        "x-session-id": logindata.sessionId
                    }
                };
                elemDivLoginErr.hidden = true;
                elemDivLoginOK.hidden = false;
                elemDivLoginOK.innerHTML = `Logged-in with account Name <b>${logindata.name}</b> - Session Id <b>${logindata.sessionId}</b>`;
                loginChanged();
                elemDivJob.hidden = false;
                fillJobPick();
            }
            else {
                let errjson = await response.json();
                elemDivLoginOK.hidden = true;
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `${errjson.message}`;
            }
            hideBusy();
        })
        .catch(error => {
            elemDivLoginOK.hidden = true;
            elemDivLoginErr.hidden = false;
            elemDivLoginErr.innerText = error;
            hideBusy();
        });
}
// ══════════════════════════════════════════════════════════════════════
async function innerLogout() {
    showBusy(`Logging out ${logindata.name}`);
    if (jobdata != null) {
        var resp = await fetch(`${elemSelServer.value}/job/close`, deleteOpts);
        console.log(resp);
        jobdata = null;
    }
    const url = `${elemSelServer.value}/session/end/return`;
    fetch(url, deleteOpts)
        .then(async response => {
            if (response.status == 200) {
                let logoutdata = await response.json();
                elemDivLoginErr.hidden = true;
                elemDivLoginOK.hidden = false;
                elemDivLoginOK.innerHTML = `Logout sucess. Remaining free licence count is ${logoutdata}.`;
                elemDivJob.hidden = true;
                elemDivGenTab.hidden = true;
                elemDivReport.hidden = true;
                elemDivVariables.innerHTML = null;
                logindata = null;
                loginChanged();
                elemTextId.focus();
            }
            else {
                let errjson = await response.json();
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `${errjson.message}`;
            }
            hideBusy();
        })
        .catch(error => {
            elemDivLoginErr.hidden = false;
            elemDivLoginErr.innerText = error;
            hideBusy();
        });
}
// ══════════════════════════════════════════════════════════════════════
function loginChanged() {
    if (logindata == null) {
        elemTextId.disabled = false;
        elemTextPass.disabled = false;
        elemSelServer.disabled = false;
        elemInstruct.hidden = false;
        elemBtnLogin.disabled = (elemTextId.value.length == 0 || elemTextPass.value.length == 0);
    } else {
        elemTextId.disabled = true;
        elemTextPass.disabled = true;
        elemBtnLogin.disabled = false;
        elemSelServer.disabled = true;
    }
    elemImgId.hidden = elemTextId.value.length > 0;
    elemImgPass.hidden = elemTextPass.value.length > 0;
    elemBtnLogin.innerText = logindata == null ? "Login" : "Logout";
}
// ══════════════════════════════════════════════════════════════════════
function openJob(reason) {
    let custName = null;
    let jobName = null;
    logindata.sessionCusts.forEach(c => {
        c.sessionJobs.forEach(j => {
            if (j.id == elemSelJob.value) {
                custName = c.name;
                jobName = j.name;
            }
        })
    });
    const openReq = {
        customerName: custName,
        jobName: jobName,
        vartreeName: null,
        getDisplayProps: true,  // Needed for GenTab later
        getVartreeNames: true,
        getAxisTreeNames: true,
        tocType: 1,
        getDrills: true
    };
    elemDivLoginErr.hidden = true;
    elemDivVariables.innerHTML = null;
    elemDivHtml.innerHTML = null;
    elemPreReport.hidden = true;
    elemDivReport.hidden = true;
    elemTop.value = null;
    elemSide.value = null;
    elemFilter.value = null;
    elemWeight.value = null;
    elemSelTrees.options.length = 0;
    postOpts.body = JSON.stringify(openReq);
    showBusy(`Opening Customer ${custName} Job ${jobName}`);
    const url = `${elemSelServer.value}/job/open`;
    fetch(url, postOpts)
        .then(async response => {
            if (response.status == 200) {
                jobdata = await response.json();
                console.log(jobdata);
                //elemSelTrees.options.length = 0;
                jobdata.vartreeNames.forEach(v => {
                    var option = document.createElement("option");
                    option.value = `V-${v}`;
                    option.innerHTML = `🔴 ${v}`;
                    elemSelTrees.add(option);
                })
                jobdata.axisTreeNames.forEach(v => {
                    var option = document.createElement("option");
                    option.value = `A-${v}`;
                    option.innerHTML = `📐 ${v}`;
                    elemSelTrees.add(option);
                })
            }
            else {
                let errjson = await response.json();
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `${errjson.message}`;
            }
            hideBusy();
        })
        .catch(error => {
            elemDivLoginErr.hidden = false;
            elemDivLoginErr.innerText = error;
            hideBusy();
        });
}
// ══════════════════════════════════════════════════════════════════════
function setActiveTree() {
    var elemList = document.getElementById("SelTrees");
    const id = elemList.value;
    const pfx = id.substring(0, 1);
    const name = id.substring(2);
    if (pfx == "V") {
        showBusy(`Setting active variable tree ${name}`);
        const url = `${elemSelServer.value}/job/vartree/${name}`;
        fetch(url, getOpts)
            .then(async response => {
                if (response.status == 200) {
                    const success = await response.json();
                    if (success) {
                        getVartreeNodes();
                    }
                    else {
                        elemDivLoginErr.hidden = false;
                        elemDivLoginErr.innerText = `Service returned 'false' setting active variable tree ${name}`;
                    }
                }
                else {
                    let errjson = await response.json();
                    elemDivLoginErr.hidden = false;
                    elemDivLoginErr.innerText = `Failed to set active variable tree ${name} - ${errjson.message}`;
                }
                hideBusy();
            })
            .catch(error => {
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `Error setting active variable tree ${url} - ${error}`;
                hideBusy();
            });
    }
}
// ══════════════════════════════════════════════════════════════════════
function getVartreeNodes() {
    showBusy("Loading variable tree");
    const url = `${elemSelServer.value}/job/vartree/nodes`;
    fetch(url, getOpts)
        .then(async response => {
            if (response.status == 200) {
                const vtdata = await response.json();
                console.log(vtdata);
                showVariables(vtdata);
            }
            else {
                let errjson = await response.json();
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `Failed to load active variable tree - ${errjson.message}`;
            }
            hideBusy();
        })
        .catch(error => {
            elemDivLoginErr.hidden = false;
            elemDivLoginErr.innerText = `Error loading active variable tree ${url} - ${error}`;
            hideBusy();
        });
}
// ══════════════════════════════════════════════════════════════════════
function genTab() {
    const formatNum = elemFormat.value;
    const formatName = elemFormat.options[elemFormat.selectedIndex].text;
    const freq = elemChkFreq.checked;
    const colpct = elemChkCol.checked;
    const rowpct = elemChkRow.checked;
    console.log(`format ${formatNum} | ${formatName} | ${freq} ${colpct} ${rowpct}`);
    if (elemTop.value.length == 0 || elemSide.value.length == 0) return;
    const specprops = {
        topInsert: null,
        sideInsert: null,
        level: null
    };
    const gentabReq = {
        name: `${elemTop.value} × ${elemSide.value}`,
        top: elemTop.value,
        side: elemSide.value,
        filter: elemFilter.value,
        weight: elemWeight.value,
        sProps: specprops,
        dProps: jobdata.dProps
    };
    gentabReq.dProps.cells.frequencies.visible = freq;
    gentabReq.dProps.cells.columnPercents.visible = colpct;
    gentabReq.dProps.cells.rowPercents.visible = rowpct;
    console.log(gentabReq);
    postOpts.body = JSON.stringify(gentabReq);
    showBusy(`Generating report`);
    const url = formatNum == 990 ? `${elemSelServer.value}/report/gentab/pandas/1` : `${elemSelServer.value}/report/gentab/text/${formatName}`;
    fetch(url, postOpts)
        .then(async response => {
            if (response.status == 200) {
                let textbody = null;
                if (formatNum == 990) {
                    const json = await response.json();
                    textbody = JSON.stringify(json, null, 4);
                    console.log("JSON");
                }
                else {
                    textbody = await response.text();
                }
                elemInstruct.hidden = true;
                elemDivLoginErr.hidden = true;
                elemDivReport.hidden = false;
                if (formatNum == 6) {
                    // Show the rendered HTML report.
                    elemPreReport.hidden = true;
                    elemDivHtml.hidden = false;
                    elemDivHtml.innerHTML = textbody;
                }
                else {
                    // Other plain text report formats.
                    elemPreReport.hidden = false;
                    elemDivHtml.hidden = true;
                    elemPreReport.innerText = textbody;
                }
            }
            else {
                let errjson = await response.json();
                console.log(errjson);
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `${errjson.message}`;
            }
            hideBusy();
        })
        .catch(error => {
            elemDivLoginErr.hidden = false;
            elemDivLoginErr.innerText = error;
            hideBusy();
        });
}
// ══════════════════════════════════════════════════════════════════════
let lastFolder = null;
let vtab = null;

function showVariables(nodes) {
    if (nodes == null) {
        elemDivLoginErr.hidden = false;
        elemDivLoginErr.innerText = `The variable tree does not contain any variables.`;
        return;
    }
    vtab = document.createElement("table");
    vtab.setAttribute("class", "VarTab");
    var tr = vtab.insertRow();
    let th1 = document.createElement("th");
    th1.innerText = "Folder";
    tr.appendChild(th1);
    let th2 = document.createElement("th");
    th2.innerText = "Variable";
    tr.appendChild(th2);
    let th3 = document.createElement("th");
    th3.innerText = "Description";
    tr.appendChild(th3);
    //td1.innerText = "Row 1 Cell 1";
    //let td2 = tr.insertCell();
    //td2.innerText = "Row 1 Cell 2";
    elemDivVariables.innerHTML = null;
    elemDivVariables.appendChild(vtab);
    unwindVartree(nodes);
}

function unwindVartree(nodes) {
    items = [];
    nodes.forEach(n => {
        if (n.type == "Folder") {
            lastFolder = n.value1;
        }
        if (n.type == "Variable") {
            var tr = vtab.insertRow();
            let td1 = tr.insertCell();
            td1.innerText = lastFolder ?? "-";
            let td2 = tr.insertCell();
            td2.innerText = n.value1;
            let td3 = tr.insertCell();
            if (n.value2.length > 0) {
                td3.innerText = n.value2;
            }
        }
        if (n.anyChildren == true) {
            unwindVartree(n.children);
        }
    });
}
// ══════════════════════════════════════════════════════════════════════
function fillJobPick() {
    logindata.sessionCusts.forEach(c => {
        c.sessionJobs.forEach(j => {
            let text = `${c.name} - ${j.name}`;
            var option = document.createElement("option");
            option.text = text;
            option.value = j.id;
            if (c.name == "client1rcs" && j.name == "demo") {
                option.selected = true;
            }
            elemSelJob.add(option);
        })
    });
    var elem = document.getElementById("LabelJobPick");
    elem.innerText = `Customer - Job (${elemSelJob.length})`;
    openJob("Initial");
}
// ══════════════════════════════════════════════════════════════════════
function showBusy(message) {
    elemDivBusy.hidden = false;
    elemBusyMsg.innerHTML = message;
}
// ══════════════════════════════════════════════════════════════════════
function hideBusy(message) {
    elemDivBusy.hidden = true;
}