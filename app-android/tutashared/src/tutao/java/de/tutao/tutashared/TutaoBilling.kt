package de.tutao.tutashared

import android.content.Context
import com.android.billingclient.api.BillingClient

fun TutaBilling.getBillingWrapper(ctx: Context): BillingWrapper {
	val builder = BillingClient.newBuilder(ctx)
	val client = builder.build()
	println(client)
	return object : BillingWrapper {
		override fun isReal(): Boolean {
			return true
		}

		override fun getPrices() {
			println("tutao prices " + client.isReady)
		}

		override fun buyThing() {
			println("google buy " + client.isReady)
		}
	}
}