package com.rockies.frontdesk;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Kiosk")
public class KioskPlugin extends Plugin {

    @PluginMethod
    public void exitKiosk(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                getActivity().stopLockTask();
            } catch (Exception ignored) {
                // Not in lock task mode — nothing to do
            }
        });
        call.resolve();
    }
}
