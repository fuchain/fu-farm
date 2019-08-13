import driver from "fuchain-js";
const bip39 = require("bip39");

class FUChain {
  constructor() {
    this.connection = new driver.Connection(
      "https://fuchain.fptu.tech/api/v1/"
    );

    this.currentIdentity = {
      privateKey: "",
      publicKey: ""
    };

    this.generateKeypair(localStorage.getItem("seed") || null).then(data => {
      this.currentIdentity = data;
    });
  }

  async generateKeypair(keySeed) {
    if (typeof keySeed == "undefined" || keySeed == "")
      return new driver.Ed25519Keypair();

    const bip39bigcoin = await bip39.mnemonicToSeed(keySeed);
    const bip39bigchain = bip39bigcoin.slice(0, 32);

    return new driver.Ed25519Keypair(bip39bigchain);
  }

  createAsset(foodItem) {
    return new Promise((resolve, reject) => {
      // Create asset object.
      const assetData = {
        type: "FuChainFarmAsset",
        item: foodItem
      };

      const metaData = {
        action: "Khởi tạo trên hệ thống",
        date: new Date().toISOString()
      };

      const introduceFoodItemToMarketTransaction = driver.Transaction.makeCreateTransaction(
        assetData,
        metaData,
        [
          driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(
              this.currentIdentity.publicKey
            )
          )
        ],
        this.currentIdentity.publicKey
      );

      const signedTransaction = driver.Transaction.signTransaction(
        introduceFoodItemToMarketTransaction,
        this.currentIdentity.privateKey
      );

      this.connection
        .postTransactionCommit(signedTransaction)
        .then(postedTransaction => {
          resolve(postedTransaction);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getAssets() {
    return new Promise((resolve, reject) => {
      this.connection
        .listOutputs(this.currentIdentity.publicKey, false)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getAllAssets() {
    return new Promise((resolve, reject) => {
      this.connection
        .searchAssets("FuChainFarmAsset")
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  loadTransaction(transactionId) {
    return new Promise((resolve, reject) => {
      // Get the transaction by its ID.
      this.connection
        .getTransaction(transactionId)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  updateAsset(transaction, action) {
    return new Promise((resolve, reject) => {
      console.log(transaction);

      const metaData = {
        action: action,
        date: new Date().toISOString()
      };

      const updateAssetTransaction = driver.Transaction.makeTransferTransaction(
        [{ tx: transaction, output_index: 0 }],

        [
          driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(
              this.currentIdentity.publicKey
            )
          )
        ],

        metaData
      );

      const signedTransaction = driver.Transaction.signTransaction(
        updateAssetTransaction,
        this.currentIdentity.privateKey
      );

      console.log("Posting transaction.");
      this.connection
        .postTransactionCommit(signedTransaction)
        .then(postedTransaction => {
          resolve(postedTransaction);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  transferAsset(transaction, receiverPublicKey) {
    return new Promise((resolve, reject) => {
      const metaData = {
        action: "Hàng được chuyển tới kho " + receiverPublicKey,
        date: new Date().toISOString()
      };

      const transferTransaction = driver.Transaction.makeTransferTransaction(
        [{ tx: transaction, output_index: 0 }],

        [
          driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(receiverPublicKey)
          )
        ],

        metaData
      );

      const signedTransaction = driver.Transaction.signTransaction(
        transferTransaction,
        this.currentIdentity.privateKey
      );

      this.connection
        .postTransactionCommit(signedTransaction)
        .then(successfullyPostedTransaction => {
          resolve(successfullyPostedTransaction);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

export default FUChain;
