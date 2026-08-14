package de.tutao.tutashared

import android.content.Context

// this is a stub that stands in for the google billing API in our f-droid build.
fun TutaBilling.getBillingWrapper(ctx: Context): BillingWrapper {
	return object : BillingWrapper {
		override fun isReal(): Boolean {
			return false
		}

		override fun getPrices() {
			println("F-droid price stuff")
		}

		override fun buyThing() {
			println("F-droid stuff")
		}
	}
}