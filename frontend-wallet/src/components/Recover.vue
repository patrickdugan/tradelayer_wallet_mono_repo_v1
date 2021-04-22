<template>
  <md-card class="md-layout md-alignment-top-center">
    <!-- <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label htmlFor="password">recover key (be careful!!!)</label>
        <input v-model="wifKey" type="password" style="margin: 0px 40px 0px; width: 250px;" name="wifKey" class="form-control" placeholder='private key' />
        <input v-model="password" type="password" style="margin: 0px 40px 0px; width: 250px;" name="password" class="form-control" placeholder='password' />
  
        <div v-show="submitted && !password" class="invalid-feedback">Password is required</div>
      </div>
      <div class="form-group">
        <md-button @click="handleSubmit" class="md-raised md-accent animated rubberBand">recover</md-button>
      </div>
    </form> -->
  <div style="display:flex; flex-direction: column">
    <form @submit.prevent="handleSubmit" class='form-container' ref='keyForm'>
      <label>Recover from KEY</label>
      <div class='inputs-container'>
        <div class='input-form'>
          <label htmlFor="password">Recover key: </label>
          <input v-model="wifKey" type="password" name="wifKey" class="form-control" placeholder='private key' />
        </div>
        <div class='input-form'>
          <label htmlFor="password">Password: </label>
          <input v-model="password" type="password" name="password" class="form-control" placeholder='password' />
        </div>
      </div>
        <div v-show="submitted && !password" class="invalid-feedback">Password is required</div>
        <md-button @click="handleSubmit" class="md-raised md-accent animated rubberBand">RECOVER FROM KEY</md-button>
    </form>

        <form @submit.prevent="handleSubmitJson" ref="jsonForm" class='form-container'>
      <label>Recover from JSON</label>
      <div class='inputs-container'>
        <div class='input-form'>
          <label htmlFor="password">JSON file: </label>
          <input @change="handleFileInputChange" type="file" name="file" class="form-control" placeholder='Json file' />
        </div>
        <div class='input-form'>
          <label >Password: </label>
          <input v-model="passwordJson" type="password" name="passwordJson" class="form-control" placeholder='password' />
        </div>
      </div>
        <div v-show="submittedJson && !passwordJson" class="invalid-feedback">Password is required</div>
        <md-button @click="handleSubmitJson" class="md-raised md-accent animated rubberBand">RECOVER FROM KEY</md-button>
    </form>
  </div>
  </md-card>
</template>

<script>
  import {
    mapState,
    mapActions,
    mapGetters,
    mapMutations
  } from 'vuex';
  
  export default {
    data: () => ({
      wifKey: '',
      password: '',
      wifKeys: [],
      passwordJson: '',
      submitted: false,
      submittedJson: false,
    }),
    methods: {
      ...mapMutations('wallet', ['addKeyPairFromWif', 'addKeyPairFromEncWifArray']),
      handleSubmit() {
        this.submitted = true
        const { wifKey, password } = this
        this.addKeyPairFromWif({ wifKey, password,next: (res) =>{
            if (res){
              this.$router.push('/Summary')
            } else {
              // this.errors.push('invallid password; try again')
            }
        } })
        this.$refs.keyForm.reset() 
      },
      handleSubmitJson(){
        this.submittedJson = true
        const { wifKeys, passwordJson } = this;
        this.addKeyPairFromEncWifArray({ wifKeys, password: passwordJson, next: (res) => {
            if (res){
              this.$router.push('/Summary')
            } else {
              // this.errors.push('invallid password; try again')
            }
        }})
        this.$refs.jsonForm.reset() 
      },
      handleFileInputChange(event) {
        const json = event.target.files[0];
        const reader = new FileReader()
        reader.onload = () => {
           this.wifKeys = JSON.parse(reader.result)

        };
        reader.readAsText(json)
      }
    }
  };
</script>

<style scoped>
  .form-container {
    display:flex;
    flex-direction: column;
    align-items: center;
    margin: 3rem;
  }
  .inputs-container {
    display:flex;
    flex-wrap: wrap;
  }
  .input-form {
    display:flex;
    flex-direction: column;
    margin: 0.5rem 0;
  }
  .input-form input {
    height: 2rem;
    font-size: 1rem;
    margin: 0.2rem 1rem;
    width: 250px;
  }
</style>
