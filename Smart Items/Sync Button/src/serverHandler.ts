import { getUserData } from "@decentraland/Identity"

let firebaseServerURL = "https://us-central1-nft-gallery-339414.cloudfunctions.net/app/"
let userData = fetchUserData()

export async function fetchUserData() {
    return await getUserData()
}

export async function isVIP(){
    let adminList = await getAdminList();
    let guestList = await getGuestList();
    let myAddress = (await fetchUserData()).publicKey;

    return adminList.includes(myAddress) || guestList.includes(myAddress)
  }

async function getWalletAddressList(title:string) {
    try {
        let response = await fetch(firebaseServerURL + title)
        let json = await response.json()
        return json[0];
    } catch (error) {
        log("error fetching " + title + "from server: " + error)
    }
}

export async function getAdminList() {
    return getWalletAddressList("get-admin-list")
}

export async function getGuestList() {
    return getWalletAddressList("get-guest-list")
}

export async function changeLampCondition(name:string, condition:boolean) {
    try {
        let response = await fetch(firebaseServerURL + "change-lamp-condition", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ name: name, condition: condition }),
        })

        return response;
    } catch (error) {
        log("error change lamp condition to server: " + error)
    }
}

export async function getLampCondition(name:string) {
    try {
        let response = await fetch(firebaseServerURL + "get-lamp-condition?name=" + name)
        let json = await response.json()
        return json[0].condition;
    } catch (error) {
        log("error fetch lamp condition from server: " + error)
    }
}

export async function addPotentialBuyer(url:string) {
    try {
        let address = (await userData).publicKey;
        let name = (await userData).displayName;

        let response = await fetch(firebaseServerURL + "add-potential-buyer", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ walletAddress: address, name: name, url: url }),
        })

        return response;
    } catch (error) {
        log("error add potential buyer to server: " + error)
    }
}