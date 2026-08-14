package de.tutao.tutanota

import android.content.Context
import de.tutao.tutashared.BillingWrapper
import de.tutao.tutashared.TutaBilling
import de.tutao.tutashared.getBillingWrapper
import de.tutao.tutashared.ipc.DataWrapper
import de.tutao.tutashared.ipc.MobilePaymentResult
import de.tutao.tutashared.ipc.MobilePaymentSubscriptionOwnership
import de.tutao.tutashared.ipc.MobilePaymentsFacade
import de.tutao.tutashared.ipc.MobilePlanPrice

class AndroidMobilePaymentsFacade(private val ctx: Context) : MobilePaymentsFacade {

	private val billingWrapper: BillingWrapper = TutaBilling().getBillingWrapper(ctx)

	override suspend fun requestSubscriptionToPlan(
		plan: String,
		interval: Long,
		customerIdBytes: DataWrapper
	): MobilePaymentResult {
		TODO("Not yet implemented")
	}

	override suspend fun getPlanPrices(): List<MobilePlanPrice> {
		println("getting prices")
		billingWrapper.getPrices()
		return listOf()
	}

	override suspend fun showSubscriptionConfigView() {
		TODO("Not yet implemented")
	}

	override suspend fun queryAppStoreSubscriptionOwnership(customerIdBytes: DataWrapper?): MobilePaymentSubscriptionOwnership {
		TODO("Not yet implemented")
	}

	override suspend fun queryPlaystorePaymentSubscriptionOwnership(customerIdBytes: DataWrapper?): MobilePaymentSubscriptionOwnership {
		TODO("Not yet implemented")
	}

	override suspend fun isExternalSubscriptionRenewalEnabled(): Boolean {
		TODO("Not yet implemented")
	}

}
