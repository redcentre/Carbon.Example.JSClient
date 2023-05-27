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

var infodata = null;
var logindata = null;
var jobdata = null;

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
function loginClick() {
    if (logindata == null) {
        innerLogin();
    }
    else {
        innerLogout();
    }
}
// ══════════════════════════════════════════════════════════════════════
function runClick() {
    genTab();
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
    getInfo();
}
// ══════════════════════════════════════════════════════════════════════
function getInfo() {
    let url = `${elemSelServer.value}/service/info`;
    fetch(url)
        .then(async response => {
            if (response.status == 200) {
                infodata = await response.json();
                loginChanged();
                elemTextId.focus();
                elemDivLoginOK.hidden = false;
                elemDivLoginOK.innerHTML = `Connected to Carbon web service version ${infodata.version}. Carbon version ${infodata.carbonVersion} Build ${infodata.carbonBuild}.`;
            }
            else {
                let errjson = await response.json();
                console.log(infodata);
                elemDivLoginErr.hidden = false;
                elemDivLoginErr.innerText = `Failed to retrieve service information from ${url} - ${errjson.message}`;
            }
        })
        .catch(error => {
            elemDivLoginErr.hidden = false;
            elemDivLoginErr.innerText = `Error retrieving service information from ${url} - ${error}`;
        });
}
// ══════════════════════════════════════════════════════════════════════
function innerLogin() {
    const loginReq = {
        id: elemTextId.value,
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
    let url = `${elemSelServer.value}/session/start/login/id`;
    fetch(url, loginOpts)
        .then(async response => {
            if (response.status == 200) {
                logindata = await response.json();
                console.log(logindata);
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
function innerLogout() {
    const logoutOpts = {
        method: "DELETE",
        headers: {
            "x-session-id": logindata.sessionId
        }
    };
    showBusy(`Logging out ${logindata.name}`);
    let url = `${elemSelServer.value}/session/end/return`;
    fetch(url, logoutOpts)
        .then(async response => {
            if (response.status == 200) {
                let logoutdata = await response.json();
                elemDivLoginErr.hidden = true;
                elemDivLoginOK.hidden = false;
                elemDivLoginOK.innerHTML = `Logout sucess. Remaining free licence count is ${logoutdata}.`;
                elemDivJob.hidden = true;
                elemDivGenTab.hidden = true;
                elemDivReport.hidden = true;
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
        elemBtnLogin.disabled = (elemTextId.value.length == 0 || elemTextPass.value.length == 0);
    } else {
        elemTextId.disabled = true;
        elemTextPass.disabled = true;
        elemBtnLogin.disabled = false;
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
        getDisplayProps: false,
        getVartreeNames: true,
        getAxisTreeNames: true,
        tocType: 1,
        getDrills: true
    };
    const openOpts = {
        method: "POST",
        body: JSON.stringify(openReq),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "x-session-id": logindata.sessionId
        }
    };
    showBusy(`Opening Customer ${custName} Job ${jobName}`);
    let url = `${elemSelServer.value}/job/open`;
    fetch(url, openOpts)
        .then(async response => {
            if (response.status == 200) {
                jobdata = await response.json();
                console.log(jobdata);
                //elemDivLoginErr.hidden = true;
                //elemDivLoginOK.hidden = false;
                //elemDivLoginOK.innerHTML = `Logged-in with account Name <b>${logindata.name}</b> - Session Id <b>${logindata.sessionId}</b>`;
                //loginChanged();
                //elemDivJob.hidden = false;
                //fillJobPick();
                var elemTrees = document.getElementById("ListTrees");
                elemTrees.options.length = 0;
                jobdata.vartreeNames.forEach(v => {
                    var option = document.createElement("option");
                    option.innerHTML = `&#128308; ${v}`;
                    elemTrees.add(option);
                })
                jobdata.axisTreeNames.forEach(v => {
                    var option = document.createElement("option");
                    option.innerHTML = `&#128208; ${v}`;
                    elemTrees.add(option);
                })
                elemDivLoginErr.hidden = true;
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
function genTab() {
    var elemTop = document.getElementById("TextTop");
    var elemSide = document.getElementById("TextSide");
    var elemFilter = document.getElementById("TextFilter");
    var elemWeight = document.getElementById("TextWeight");
    if (elemTop.value.length == 0 || elemSide.value.length == 0) return;
    console.log(`Runspec ${elemTop.value} | ${elemSide.value}`);
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