package com.gromotion.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Make WebView transparent for AR camera passthrough
        WebView webView = this.bridge.getWebView();
        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
    }
}
