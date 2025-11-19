package com.gromotion.app.ar;

import android.graphics.Color;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.view.Gravity;

import androidx.annotation.NonNull;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.ar.core.Anchor;
import com.google.ar.core.Config;
import com.google.ar.core.Frame;
import com.google.ar.core.HitResult;
import com.google.ar.core.Plane;
import com.google.ar.core.Point;
import com.google.ar.core.Pose;
import com.google.ar.core.Session;
import com.google.ar.core.TrackingState;
import com.google.ar.core.Camera;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import org.json.JSONException;

@CapacitorPlugin(name = "AR")
public class ARPlugin extends Plugin {
    private Session session;
    private FrameLayout arContainer;
    private boolean isSessionRunning = false;
    private Map<String, Anchor> anchors = new HashMap<>();
    private Map<String, TextView> coinViews = new HashMap<>();
    private Map<String, String> frameSubscriptions = new HashMap<>();
    private List<Anchor> placedCoins = new ArrayList<>();
    private Camera camera;

    @PluginMethod
    public void attachViewBehindWebView(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                ViewGroup root = (ViewGroup) getBridge().getWebView().getParent();
                arContainer = new FrameLayout(getContext());
                arContainer.setLayoutParams(new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                ));
                
                // Insert AR container behind WebView
                root.addView(arContainer, 0);
                
                // Make WebView transparent
                getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
                
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to attach AR view: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void startSession(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                if (session == null) {
                    session = new Session(getContext());
                }
                
                Config config = new Config(session);
                config.setPlaneFindingMode(Config.PlaneFindingMode.HORIZONTAL_AND_VERTICAL);
                config.setUpdateMode(Config.UpdateMode.LATEST_CAMERA_IMAGE);
                session.configure(config);
                
                session.resume();
                isSessionRunning = true;
                
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to start AR session: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void stopSession(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                if (session != null) {
                    session.pause();
                    isSessionRunning = false;
                }
                
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to stop AR session: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void addAnchor(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                float x = call.getDouble("x", 0.0).floatValue();
                float y = call.getDouble("y", 0.0).floatValue();
                float z = call.getDouble("z", 0.0).floatValue();
                boolean attachToPlane = call.getBoolean("attachToPlane", false);
                
                if (session == null) {
                    call.reject("AR session not started");
                    return;
                }
                
                // Create anchor at specified position
                Pose pose = new Pose(new float[]{x, y, z}, new float[]{0, 0, 0, 1});
                Anchor anchor = session.createAnchor(pose);
                String anchorId = "anchor_" + System.currentTimeMillis();
                anchors.put(anchorId, anchor);
                
                // Create visual representation (simple text view for now)
                TextView coinView = new TextView(getContext());
                coinView.setText("🪙");
                coinView.setTextSize(24);
                coinView.setGravity(Gravity.CENTER);
                coinView.setLayoutParams(new FrameLayout.LayoutParams(
                    100, 100, Gravity.CENTER
                ));
                
                coinViews.put(anchorId, coinView);
                arContainer.addView(coinView);
                
                JSObject ret = new JSObject();
                ret.put("anchorId", anchorId);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to add anchor: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void removeAnchor(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                String anchorId = call.getString("anchorId");
                if (anchorId == null) {
                    call.reject("anchorId is required");
                    return;
                }
                
                Anchor anchor = anchors.remove(anchorId);
                TextView coinView = coinViews.remove(anchorId);
                
                if (anchor != null) {
                    anchor.detach();
                }
                
                if (coinView != null && arContainer != null) {
                    arContainer.removeView(coinView);
                }
                
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to remove anchor: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void getCameraPose(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                if (session == null || camera == null) {
                    call.reject("AR session not started");
                    return;
                }
                
                Pose pose = camera.getPose();
                float[] translation = pose.getTranslation();
                float[] rotation = pose.getRotationQuaternion();
                
                JSObject ret = new JSObject();
                ret.put("position", createPositionArray(translation[0], translation[1], translation[2]));
                ret.put("rotation", createRotationArray(rotation[0], rotation[1], rotation[2], rotation[3]));
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to get camera pose: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void performHitTest(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                float x = call.getDouble("x", 0.5).floatValue();
                float y = call.getDouble("y", 0.5).floatValue();
                
                if (session == null) {
                    call.reject("AR session not started");
                    return;
                }
                
                // Get current frame
                Frame frame = session.update();
                
                // Perform hit test
                List<HitResult> hitResults = frame.hitTest(x, y);
                
                JSArray results = new JSArray();
                for (HitResult hit : hitResults) {
                    if (hit.getTrackable() instanceof Plane) {
                        Plane plane = (Plane) hit.getTrackable();
                        if (plane.getTrackingState() == TrackingState.TRACKING) {
                            Pose hitPose = hit.getHitPose();
                            float[] translation = hitPose.getTranslation();
                            
                            JSObject hitResult = new JSObject();
                            hitResult.put("position", createPositionArray(translation[0], translation[1], translation[2]));
                            hitResult.put("type", "plane");
                            results.put(hitResult);
                        }
                    }
                }
                
                JSObject ret = new JSObject();
                ret.put("results", results);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to perform hit test: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void onFrame(PluginCall call) {
        try {
            String callbackId = call.getCallbackId();
            if (callbackId != null) {
                frameSubscriptions.put(callbackId, callbackId);
                call.setKeepAlive(true);
            }
            
            JSObject ret = new JSObject();
            ret.put("callbackId", callbackId);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to register frame callback: " + e.getMessage());
        }
    }

    @PluginMethod
    public void removeFrameCallback(PluginCall call) {
        try {
            String callbackId = call.getString("callbackId");
            if (callbackId != null) {
                frameSubscriptions.remove(callbackId);
            }
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to remove frame callback: " + e.getMessage());
        }
    }

    private JSArray createPositionArray(float x, float y, float z) {
        JSArray array = new JSArray();
        try {
            array.put(x);
            array.put(y);
            array.put(z);
        } catch (JSONException e) {
            // Handle JSON exception
        }
        return array;
    }

    private JSArray createRotationArray(float x, float y, float z, float w) {
        JSArray array = new JSArray();
        try {
            array.put(x);
            array.put(y);
            array.put(z);
            array.put(w);
        } catch (JSONException e) {
            // Handle JSON exception
        }
        return array;
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (session != null && isSessionRunning) {
            try {
                session.resume();
            } catch (Exception e) {
                // Handle resume error
            }
        }
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        if (session != null) {
            session.pause();
        }
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (session != null) {
            session.close();
            session = null;
        }
    }
}