package com.rockies.frontdesk;

import android.app.ActivityManager;
import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(KioskPlugin.class);
        super.onCreate(savedInstanceState);

        // Keep screen always on — never sleep
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        // Lock task mode — pins this app so Back/Home cannot exit it.
        // Requires Device Owner setup via ADB for full effect; gracefully
        // ignored if the device is not a Device Owner.
        ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        if (am != null && am.isInLockTaskMode()) {
            // Already pinned — nothing to do
        } else {
            try {
                startLockTask();
            } catch (Exception ignored) {
                // Not a Device Owner — screen pinning must be enabled manually
            }
        }
    }

    @Override
    public void onBackPressed() {
        // Swallow the back button — kiosk should never exit
    }
}
