<template>
    <md-table md-card style="height: 268px">
        <md-table-row> 
              <md-table-cell> 
              <md-icon>offline_bolt</md-icon>
              <md-tooltip md-direction="top">Margin Balance</md-tooltip>
            </md-table-cell>
            <md-table-cell> 
              <md-icon>chat_bubble_outline</md-icon>
              <md-tooltip md-direction="top">Quote Price</md-tooltip>
            </md-table-cell>
            <md-table-cell> 
              <md-icon>menu_book</md-icon>
              <md-tooltip md-direction="top">Unpublished Trade Size</md-tooltip>
            </md-table-cell>
                 <md-table-cell> 
              <md-icon>person</md-icon>
              <md-tooltip md-direction="top">address</md-tooltip>
            </md-table-cell>
        </md-table-row>

        <md-table-row  v-for="(channel) in channels"  v-bind:key="channel.address" @click="handleChannelClick(channel)">
            <md-table-cell>{{channel.marginBalance}}</md-table-cell>                       
            <md-table-cell>{{channel.quotePrice}} </md-table-cell>
            <md-table-cell>{{channel.unpublishedTradeSize}} </md-table-cell>
            <md-table-cell>{{channel.address}} </md-table-cell>
        </md-table-row>

    </md-table>
 
</template>
<script>
import socket from '../socket/socketconnect.js'
import {socketService } from "../services";
import { mapGetters } from "vuex";

export default {
  name: "TradeChannels",
  data() {
    const dummyChannels = [
        {
          marginBalance: 1,
          quotePrice: 2,
          unpublishedTradeSize: 3,
          address: "0xdanielgoldman",
          id: 123
        },
        {
          marginBalance: 4,
          quotePrice: 5,
          unpublishedTradeSize: 6,
          address: "0xsatoshinakamoto",
          id: 456
        }
      ]
    return {
      channels: dummyChannels
    };
  },
  computed: {
          ...mapGetters('wallet', ['addressGetter']),
  },
  mounted(){

    socket.on('receiveChannels', (newChannelsHash)=>{
      const currentChannelIds = new Set(this.channels.map((channel)=> channel.id));
      const channelsToAdd = []

      Object.keys(newChannelsHash).forEach((channelId)=>{
        if (!currentChannelIds.has(channelId)){
          channelsToAdd.push(newChannelsHash[channelId])
        }
      })      
      this.channels = this.channels.concat(channelsToAdd)

    })

    socket.on('receiveChannelProposal', (data)=>{
      const channelData = (({ marginBalance, quotePrice, unpublishedTradeSize, address, id }) => ( 
        {marginBalance, quotePrice, unpublishedTradeSize, address, id }
        ))(data);
        this.channels.push(channelData)
      
  
    })
  },
  methods: {
    handleChannelClick(channel){
      socketService.sendIOI(channel, this.addressGetter)
    }
  }
};
</script>