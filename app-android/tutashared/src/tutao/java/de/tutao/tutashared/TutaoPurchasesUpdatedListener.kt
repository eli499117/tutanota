package de.tutao.tutashared

import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener

class TutaoPurchasesUpdatedListener : PurchasesUpdatedListener {
	override fun onPurchasesUpdated(
		p0: BillingResult,
		p1: List<Purchase?>?
	) {
		println("got a result: $p0")
	}
}