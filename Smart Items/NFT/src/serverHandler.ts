import { getUserData } from "@decentraland/Identity"

let firebaseServerURL = "https://us-central1-nft-gallery-339414.cloudfunctions.net/app/"
let userData = fetchUserData()

async function fetchUserData() {
    return await getUserData()
  }

export async function addPotentialBuyer() {
    let address = (await userData).publicKey;
    let name = (await userData).displayName;

    let response = await fetch(firebaseServerURL + "add-potential-buyer", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ walletAddress: address, name: name }),
    })
  }