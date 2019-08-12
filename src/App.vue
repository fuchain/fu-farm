<template>
  <div id="ftf-container" v-if="loaded">
    <div class="ftf-header">
      <a href="https://blockchain.fptu.tech" target="_blank">
        <img src="https://i.imgur.com/LWaP5Qi.png" width="75px" />
      </a>
      <h1
        style="color: #7367F0; margin-left: 1rem; margin-top: 1.2rem;"
      >FUFarm Supply Chain Developer Preview</h1>
      <div
        class="ftf-button ftf-primary"
        style="float: right; margin-top: 2.5rem"
      >Đã kết nối vào FUChain Testnet</div>
    </div>

    <!-- Page container -->
    <div class="ftf-page-container">
      <!-- Menu -->
      <div class="ftf-menu">
        <div class="ftf-menu-item" v-on:click="menuClicked('identity')">
          <div class="ftf-menu-item-link">Kho hàng</div>
        </div>

        <div class="ftf-menu-item" v-on:click="menuClicked('assets')" v-if="isLoggedIn">
          <div class="ftf-menu-item-link">Hàng trong kho</div>
        </div>

        <div class="ftf-menu-item" v-on:click="menuClicked('all-assets')">
          <div class="ftf-menu-item-link">Tất cả hàng</div>
        </div>

        <div class="ftf-menu-item" v-on:click="menuClicked('qrscan')">
          <div class="ftf-menu-item-link">Quét mã QR</div>
        </div>

        <div class="ftf-menu-item" v-on:click="logout()" v-if="isLoggedIn">
          <div class="ftf-menu-item-link">Đăng xuất</div>
        </div>
      </div>

      <!-- Content container -->
      <div class="ftf-content-container">
        <!-- Identity pane -->
        <div v-if="isActive('identity')" class="ftf-content-pane">
          <div class="ftf-box" v-if="isLoggedIn">
            <h2>Địa chỉ kho hàng của bạn</h2>
            <hr />
            <p>{{ this.fuchain.currentIdentity.publicKey }}</p>
          </div>

          <div class="ftf-box ftf-full ftf-wide" v-if="!isLoggedIn">
            <h2>Chìa khóa kho hàng</h2>
            <hr />
            <p>
              Bạn chưa có kho hàng, nhập một chuỗi bất kì và nhấn tạo để tạo
              kho hàng của bạn
            </p>
            <div class="ftf-control">
              <input v-model="identitySeedInput" type="text" />
              <div class="ftf-input-button" v-on:click="identityButtonClicked()">Tạo</div>
            </div>
          </div>
        </div>

        <div v-if="isActive('assets')" class="ftf-content-pane">
          <div class="ftf-box">
            <h2>Hàng hóa trong kho</h2>
            <hr />
            <p>
              Hàng hoá trong kho của bạn đã, đang và sẽ được ghi nhận vào sổ
              cái phân tán trong quá khứ, hiện tại và tương lai
            </p>
          </div>

          <div class="ftf-box ftf-full ftf-wide">
            <h2>Tạo hàng hoá mới</h2>
            <p>Nhập tên/mô tả cho hàng hoá của bạn:</p>
            <div class="ftf-control">
              <input v-model="assetInput" type="text" />
              <div class="ftf-input-button" v-on:click="assetButtonClicked()">tạo</div>
            </div>
            <br />
            <h2>Hàng hóa trong kho của bạn</h2>
            <table>
              <thead>
                <tr>
                  <th>Mô tả</th>
                  <th>ID Hàng hóa</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="asset in assets"
                  v-bind:key="asset.id"
                  v-on:click="transactionClicked(asset.id, true)"
                >
                  <td>{{ asset.asset.data.item }}</td>
                  <td>{{ asset.id }}</td>
                </tr>
                <tr v-if="assets.size == 0">
                  <td colspan="2" style="text-align: left">No food-items.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="isActive('transactions')" class="ftf-content-pane">
          <div class="ftf-box ftf-wide">
            <h2>
              Chuỗi công đoạn vận chuyển cuả hàng hóa:
              {{ activeTransaction.asset.data.item }}
            </h2>
            <hr />
            <p>
              Mỗi hàng hoà đều có chuỗi công đoạn liên quan đến vân chuyển,
              chất chứa, dễ dàng cho việc truy xuất nguồn gốc và kiểm tra.
            </p>
          </div>

          <div
            class="ftf-box ftf-wide ftf-box-no-margin"
            v-if="myAssets"
            style="margin-bottom: 4rem;"
          >
            <h2>
              Cập nhật trạng thái hàng hoá:
              {{ activeTransaction.asset.data.item }}
            </h2>
            <p>Nhập mô tả để cập nhật:</p>
            <div class="ftf-control">
              <input type="text" v-model="actionInput" />
              <div class="ftf-input-button" v-on:click="actionButtonClicked()">lưu</div>
            </div>

            <h2>HOẶC</h2>

            <h2>Chuyển hàng tới kho khác</h2>
            <p>
              Khi chuyển hàng, số cái sẽ cập nhật chuỗi công đoạn của hàng hoá
              này lên mạng lưới blockchain
            </p>
            <p>Nhập địa chỉ kho hàng của bên nhận:</p>
            <div class="ftf-control">
              <input type="text" v-model="otherFirmInput" />
              <div class="ftf-input-button" v-on:click="otherFirmButtonClicked()">chuyển</div>
            </div>
          </div>

          <span
            class="ftf-full"
            v-for="(transaction, index) in transactionsForAsset.slice().reverse()"
            v-bind:key="transaction.id"
          >
            <div class="ftf-arrow ftf-full" v-if="index !== 0"></div>
            <div class="ftf-box ftf-wide ftf-box-no-margin">
              <h2>{{ transaction.metadata.action }}</h2>
              <p>{{new Date(transaction.metadata.date).toLocaleString()}}</p>
            </div>
          </span>
        </div>

        <div v-if="isActive('qrscan')" class="ftf-content-pane">
          <div class="ftf-box" v-if="!error">
            <QRScan @printCode="notify" @onFail="handleFail" />
          </div>
        </div>

        <div v-if="isActive('all-assets')" class="ftf-content-pane">
          <div class="ftf-box">
            <h2>Hàng hóa trong chuỗi cung ứng</h2>
            <hr />
            <p>
              Hàng hóa được luân chuyển trên chuỗi cung ứng, và được ghi nhận
              vào sổ cái phân tán trong mỗi giai đoạn vận chuyển, xử lí.
            </p>
          </div>

          <div class="ftf-box ftf-full">
            <table>
              <thead>
                <tr>
                  <th>Mô tả</th>
                  <th>ID Hàng hóa</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="asset of allAssets"
                  v-on:click="transactionClicked(asset.id, false)"
                  v-bind:key="asset.id"
                >
                  <td>{{ asset.data.item }}</td>
                  <td>{{ asset.id }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FUChain from "@/core/fuchain";
import QRScan from "@/QRScan.vue";

export default {
  name: "app",
  components: {
    QRScan
  },
  data() {
    return {
      error: false,
      fuchain: new FUChain(),
      loaded: false,
      activePane: "identity",

      // Inputs
      identitySeedInput: localStorage.getItem("seed") || null,
      assetInput: "",
      actionInput: "",
      otherFirmInput: "",
      activeTransaction: {
        asset: {
          data: {
            item: "Loading..."
          }
        }
      },

      // Assets
      transactionIds: new Array(),
      assets: new Array(),
      transactionsForAsset: new Array(),
      allAssets: new Array(),

      // Flag
      myAssets: false
    };
  },
  computed: {
    isLoggedIn() {
      return localStorage.getItem("seed") ? true : false;
    }
  },
  mounted() {
    this.loaded = true;

    const loader = this.$loading.show({
      container: null,
      loader: "dots",
      color: "#7367F0"
    });

    setTimeout(() => {
      loader.hide();
    }, 1000);
  },
  methods: {
    notify(id) {
      this.fuchain.connection
        .getTransaction(id)
        .then(response => (this.activeTransaction = response));
      this.loadTransactionsForAsset(id);
      this.setActive("transactions");
    },
    handleFail(val) {
      if (val) {
        this.error = true;
      }
    },
    logout() {
      localStorage.removeItem("seed");
      location.reload();
    },
    setActive(pane) {
      this.activePane = pane;
    },
    isActive(pane) {
      return this.activePane == pane;
    },
    getAssets() {
      return this.assets;
    },

    // Forms
    identityButtonClicked() {
      if (!this.identitySeedInput) {
        alert("Không được để trống chuỗi này!");
        return;
      }

      this.fuchain.currentIdentity = this.fuchain.generateKeypair(
        this.identitySeedInput
      );

      localStorage.setItem("seed", this.identitySeedInput);
      location.reload();
    },
    assetButtonClicked() {
      if (this.assetInput == "") return;
      this.fuchain.createAsset(this.assetInput).then(() => {
        console.log("New asset added.");
        // Do nothing, just reload the asset list.
        this.loadAssetsIds();
      });
    },

    // Menu
    menuClicked(link) {
      const loader = this.$loading.show({
        container: null,
        loader: "dots",
        color: "#7367F0"
      });

      setTimeout(() => {
        loader.hide();
      }, 500);

      switch (link) {
        case "identity":
          this.activePane = "identity";
          break;

        case "assets":
          this.loadAssetsIds();
          this.activePane = "assets";
          break;

        case "all-assets":
          this.loadAllAssets();
          this.activePane = "all-assets";
          break;

        case "qrscan":
          this.activePane = "qrscan";
          break;
      }
    },

    // Loading assets
    loadAssetsIds() {
      this.fuchain.getAssets().then(response => {
        this.transactionIds = response;
        this.loadAssetsFromTransactionIds();
      });
    },
    loadAllAssets() {
      this.fuchain.getAllAssets().then(response => {
        this.allAssets = response;
      });
    },
    loadAssetsFromTransactionIds() {
      this.assets = new Array();

      for (let transaction of this.transactionIds) {
        this.fuchain.connection
          .getTransaction(transaction.transaction_id)
          .then(response => {
            if (response.operation == "CREATE")
              return this.fuchain.connection.listTransactions(
                response.id,
                "CREATE"
              );
            return this.fuchain.connection.listTransactions(
              response.asset.id,
              "CREATE"
            );
          })
          .then(responseCreate => {
            this.assets.push(responseCreate[0]);
          })
          .catch(() => {
            console.log(transaction.transaction_id);
          });
      }
    },
    transactionClicked(id, myAssets) {
      this.myAssets = myAssets;
      this.fuchain.connection
        .getTransaction(id)
        .then(response => (this.activeTransaction = response));
      this.loadTransactionsForAsset(id);
      this.setActive("transactions");
    },
    loadTransactionsForAsset(assetId) {
      this.fuchain.connection
        .listTransactions(assetId)
        .then(response => (this.transactionsForAsset = response));
    },
    actionButtonClicked() {
      this.fuchain.connection
        .listTransactions(this.activeTransaction.id)
        .then(response => {
          return this.fuchain.updateAsset(
            response[response.length - 1],
            this.actionInput
          );
        })
        .then(() => {
          this.loadTransactionsForAsset(this.activeTransaction.id);
        });
    },
    otherFirmButtonClicked() {
      this.fuchain.connection
        .listTransactions(this.activeTransaction.id)
        .then(response => {
          return this.fuchain.transferAsset(
            response[response.length - 1],
            this.otherFirmInput
          );
        })
        .then(() => {
          // Don't do anything with the response, go back to asset overview.
          this.menuClicked("assets");
        });
    }
  },
  errorCaptured(err, vm, info) {
    // Print log error
    console.log("Error: ", err.toString());
    console.log("Info: ", info.toString());

    alert("Có lỗi xảy ra!");
  }
};
</script>

<style lang="css">
:root {
  --ftf-color-1: rgb(216, 216, 216);
  --ftf-color-header: white;
  --ftf-padding: 15px;
  --ftf-padding-small: 8px;
  --ftf-menu-width: 200px;
  --ftf-button-padding: 10px;

  --ftf-color-primary: #7367f0;
  --ftf-color-primary-alt: #7367f0;

  --ftf-color-menu: #7367f0;
  --ftf-color-menu-alt: #7367f0;

  --ftf-color-table: #7367f0;
  --ftf-color-table-alt: rgb(220, 237, 255);
  --ftf-color-table-alt-hover: rgb(179, 215, 253);

  --ftf-color-black: rgba(0, 0, 0, 0.7);

  --ftf-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  float: left;

  color: var(--ftf-color-black);
  font-family: "Montserrat";
}

#ftf-container {
  display: flex;
  flex-direction: column;
}

body {
  position: absolute;
  width: 100%;
  height: 100%;
}

#ftf-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--ftf-color-1);
}

.ftf-header {
  padding: var(--ftf-padding);
  background-color: var(--ftf-color-header);
  box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.2);

  display: block;
  /* justify-content: space-between;
  align-items: center; */

  color: var(--ftf-color-black);
}

.ftf-header * {
  margin: 0;
}

.ftf-header h1 {
  font-size: 2em;
}

.ftf-button {
  padding: var(--ftf-button-padding);
  cursor: pointer;
  border-radius: 5px;
}

.ftf-primary {
  background-color: var(--ftf-color-primary);
  color: white;
}

.ftf-primary:hover {
  background-color: var(--ftf-color-primary-alt);
}

.ftf-page-container {
  width: 100%;
  height: calc(100% - 2em - 2 * var(--ftf-padding));

  overflow: auto;
}

.ftf-menu {
  height: 100%;
  padding: var(--ftf-padding);

  background-color: var(--ftf-color-menu);
  color: white;

  display: flex;
  flex-direction: column;
}

.ftf-menu-item {
  color: white !important;
  padding: var(--ftf-padding);
  width: var(--ftf-menu-width);

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  font-size: 1.2em;
  cursor: pointer;
  border-radius: 5px;
}

.ftf-menu-item:hover {
  transition: 0.5s;

  background-color: var(--ftf-color-menu-alt);
}

.ftf-menu-item * {
  color: white;
}

.ftf-menu hr {
  border: 0;
  border-top: 1px solid white;
  margin-top: var(--ftf-padding);
  margin-bottom: var(--ftf-padding);
}

.ftf-content-container {
  height: 100%;
  width: calc(100% - var(--ftf-menu-width) - 3 * var(--ftf-button-padding));

  padding: calc(2 * var(--ftf-padding));

  overflow: auto;
}

.ftf-content-pane {
  width: 100%;
  height: 100%;
}

.ftf-box {
  background-color: white;
  box-shadow: var(--ftf-shadow);
  padding: var(--ftf-padding);

  color: var(--ftf-color-black);

  margin-bottom: calc(2 * var(--ftf-padding));
}

.ftf-box:last-child {
  margin-bottom: var(--ftf-padding) !important;
}

.ftf-full {
  width: 100%;
}

.ftf-wide {
  max-width: 900px;
  margin-right: calc(100% - 900px);
}

.ftf-box h2 {
  margin: 0;
  margin-top: var(--ftf-padding);
  padding: 0;
  width: 100%;
  font-size: 1.2em;
}

.ftf-box h2:first-of-type {
  margin-top: 0;
}

.ftf-box hr {
  margin-top: var(--ftf-padding);
  margin-bottom: var(--ftf-padding);

  width: 100%;

  border: 0;
  border-top: 1px solid var(--ftf-color-black);
}

.ftf-control {
  width: 100%;
  padding: calc(var(--ftf-padding) / 2);

  display: flex;
  flex-direction: row;
  justify-content: stretch;
}

.ftf-control input {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;

  border-left: 1px solid var(--ftf-color-black);
  border-bottom: 1px solid var(--ftf-color-black);
  border-top: 1px solid var(--ftf-color-black);
  border-right: 0;

  width: 100%;
}

.ftf-control .ftf-input-button,
.ftf-control input {
  padding: var(--ftf-padding-small);
  font-size: 1em;

  height: calc(1em + var(--ftf-padding-small) * 2 + 2px);
}

.ftf-control .ftf-input-button {
  background-color: var(--ftf-color-primary);
  color: white;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;

  line-height: 1em;
  border-top: 1px solid var(--ftf-color-primary-border);
  border-right: 1px solid var(--ftf-color-primary-border);
  border-bottom: 1px solid var(--ftf-color-primary-border);

  cursor: pointer;
}

.ftf-control .ftf-input-button:hover {
  background-color: var(--ftf-color-primary-alt);
}

.ftf-box table {
  width: 100%;

  margin-top: var(--ftf-padding);

  border-collapse: collapse;
}

.ftf-box table * {
  float: none;
}

.ftf-box table thead {
  background-color: var(--ftf-color-table);
  color: white !important;
  padding: calc(var(--ftf-padding) / 2);
  width: 100%;
}

.ftf-box table thead tr,
.ftf-box table tbody tr {
  width: 100%;
}

.ftf-box table thead tr th {
  padding: calc(var(--ftf-padding) / 2);
  text-align: left;
  color: white;
}

.ftf-box table tbody tr td {
  padding: calc(var(--ftf-padding) / 2);
  text-align: left;
  color: black;
}

.ftf-box table tbody tr:nth-child(even) {
  background-color: var(--ftf-color-table-alt);
}

.ftf-box table th:last-child,
.ftf-box td:last-child {
  text-align: right;
}

.ftf-box table tbody tr:hover {
  background-color: var(--ftf-color-table-alt-hover);
  cursor: pointer;
}

.ftf-arrow {
  height: 100px;
  background-image: url("/arrow.png");
  background-repeat: no-repeat;
}

.ftf-box-no-margin {
  margin-bottom: 0;
}
</style>
