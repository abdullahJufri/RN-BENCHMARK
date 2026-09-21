# Add project specific ProGuard rules here.

# React Native & JNI
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# op-sqlite JSI C++ bridge
-keep class com.op.sqlite.** { *; }

# React Navigation & Screens
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
