#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import <sys/socket.h>
#import <netinet/in.h>
#import <arpa/inet.h>
#import <unistd.h>

@interface DomoLocalServer : NSObject
@property (assign, nonatomic) int port;
@property (strong, nonatomic) NSString *documentRoot;
- (BOOL)start;
@end

@implementation DomoLocalServer

- (NSString *)mimeTypeForPath:(NSString *)path {
    NSString *ext = [[path pathExtension] lowercaseString];
    if ([ext isEqualToString:@"html"] || [ext isEqualToString:@"htm"]) return @"text/html; charset=utf-8";
    if ([ext isEqualToString:@"js"] || [ext isEqualToString:@"mjs"]) return @"text/javascript; charset=utf-8";
    if ([ext isEqualToString:@"css"]) return @"text/css; charset=utf-8";
    if ([ext isEqualToString:@"png"]) return @"image/png";
    if ([ext isEqualToString:@"jpg"] || [ext isEqualToString:@"jpeg"]) return @"image/jpeg";
    if ([ext isEqualToString:@"svg"]) return @"image/svg+xml";
    if ([ext isEqualToString:@"gif"]) return @"image/gif";
    if ([ext isEqualToString:@"webp"]) return @"image/webp";
    if ([ext isEqualToString:@"ico"]) return @"image/x-icon";
    if ([ext isEqualToString:@"json"]) return @"application/json";
    if ([ext isEqualToString:@"wasm"]) return @"application/wasm";
    if ([ext isEqualToString:@"webm"]) return @"video/webm";
    if ([ext isEqualToString:@"mp4"]) return @"video/mp4";
    if ([ext isEqualToString:@"mov"]) return @"video/quicktime";
    if ([ext isEqualToString:@"woff2"]) return @"font/woff2";
    if ([ext isEqualToString:@"woff"]) return @"font/woff";
    if ([ext isEqualToString:@"ttf"]) return @"font/ttf";
    return @"application/octet-stream";
}

- (void)handleClient:(int)clientSocket {
    char buffer[4096];
    ssize_t bytesRead = read(clientSocket, buffer, sizeof(buffer) - 1);
    if (bytesRead <= 0) {
        close(clientSocket);
        return;
    }
    buffer[bytesRead] = '\0';
    
    char method[16], rawPath[1024], protocol[16];
    if (sscanf(buffer, "%15s %1023s %15s", method, rawPath, protocol) < 2) {
        close(clientSocket);
        return;
    }

    NSString *reqPath = [NSString stringWithUTF8String:rawPath];
    NSRange qRange = [reqPath rangeOfString:@"?"];
    if (qRange.location != NSNotFound) {
        reqPath = [reqPath substringToIndex:qRange.location];
    }
    reqPath = [reqPath stringByRemovingPercentEncoding];

    NSString *targetFilePath = [self.documentRoot stringByAppendingPathComponent:reqPath];
    BOOL isDir = NO;
    BOOL exists = [[NSFileManager defaultManager] fileExistsAtPath:targetFilePath isDirectory:&isDir];

    if (!exists || isDir) {
        NSString *indexPath = [targetFilePath stringByAppendingPathComponent:@"index.html"];
        if ([[NSFileManager defaultManager] fileExistsAtPath:indexPath]) {
            targetFilePath = indexPath;
            exists = YES;
            isDir = NO;
        } else {
            NSString *rootIndex = [self.documentRoot stringByAppendingPathComponent:@"index.html"];
            if ([[NSFileManager defaultManager] fileExistsAtPath:rootIndex]) {
                targetFilePath = rootIndex;
                exists = YES;
                isDir = NO;
            }
        }
    }

    if (exists && !isDir) {
        NSData *fileData = [NSData dataWithContentsOfFile:targetFilePath];
        if (fileData) {
            NSString *mime = [self mimeTypeForPath:targetFilePath];
            NSString *header = [NSString stringWithFormat:
                @"HTTP/1.1 200 OK\r\n"
                @"Content-Type: %@\r\n"
                @"Content-Length: %lu\r\n"
                @"Connection: close\r\n"
                @"Access-Control-Allow-Origin: *\r\n\r\n",
                mime, (unsigned long)[fileData length]];
            NSData *headerData = [header dataUsingEncoding:NSUTF8StringEncoding];
            write(clientSocket, [headerData bytes], [headerData length]);
            write(clientSocket, [fileData bytes], [fileData length]);
            close(clientSocket);
            return;
        }
    }

    const char *notFound = "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found";
    write(clientSocket, notFound, strlen(notFound));
    close(clientSocket);
}

- (BOOL)start {
    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket < 0) return NO;

    int opt = 1;
    setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in address;
    memset(&address, 0, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr("127.0.0.1");
    address.sin_port = htons(0);

    if (bind(serverSocket, (struct sockaddr *)&address, sizeof(address)) < 0) {
        close(serverSocket);
        return NO;
    }

    socklen_t addrLen = sizeof(address);
    if (getsockname(serverSocket, (struct sockaddr *)&address, &addrLen) == 0) {
        self.port = ntohs(address.sin_port);
    } else {
        self.port = 45892;
    }

    if (listen(serverSocket, 64) < 0) {
        close(serverSocket);
        return NO;
    }

    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        while (1) {
            struct sockaddr_in clientAddr;
            socklen_t clientLen = sizeof(clientAddr);
            int clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddr, &clientLen);
            if (clientSocket >= 0) {
                dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                    [self handleClient:clientSocket];
                });
            }
        }
    });

    return YES;
}

@end

@interface DomoAppDelegate : NSObject <NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate>
@property (strong, nonatomic) NSWindow *window;
@property (strong, nonatomic) WKWebView *webView;
@property (strong, nonatomic) DomoLocalServer *localServer;
@end

@implementation DomoAppDelegate

- (void)startOllamaCORS {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_BACKGROUND, 0), ^{
        @try {
            // 1. Set launchctl system environment variable for macOS Ollama processes
            NSTask *launchctlTask = [[NSTask alloc] init];
            [launchctlTask setLaunchPath:@"/bin/launchctl"];
            [launchctlTask setArguments:@[@"setenv", @"OLLAMA_ORIGINS", @"*"]];
            [launchctlTask launch];
            [launchctlTask waitUntilExit];
        } @catch (NSException *e) {}

        // 2. Check if Ollama is already responding on port 11434
        int testSock = socket(AF_INET, SOCK_STREAM, 0);
        if (testSock >= 0) {
            struct sockaddr_in serverAddr;
            memset(&serverAddr, 0, sizeof(serverAddr));
            serverAddr.sin_family = AF_INET;
            serverAddr.sin_port = htons(11434);
            serverAddr.sin_addr.s_addr = inet_addr("127.0.0.1");

            // Set 1s timeout
            struct timeval tv;
            tv.tv_sec = 1;
            tv.tv_usec = 0;
            setsockopt(testSock, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof(tv));
            setsockopt(testSock, SOL_SOCKET, SO_SNDTIMEO, (const char*)&tv, sizeof(tv));

            if (connect(testSock, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) == 0) {
                close(testSock);
                // Ollama is already running and listening
                return;
            }
            close(testSock);
        }

        // 3. Find Ollama binary path
        NSArray *candidatePaths = @[
            @"/opt/homebrew/bin/ollama",
            @"/usr/local/bin/ollama",
            @"/usr/bin/ollama",
            [NSHomeDirectory() stringByAppendingPathComponent:@".ollama/bin/ollama"],
            @"/Applications/Ollama.app/Contents/Resources/ollama"
        ];

        NSString *foundOllamaPath = nil;
        for (NSString *candidate in candidatePaths) {
            if ([[NSFileManager defaultManager] isExecutableFileAtPath:candidate]) {
                foundOllamaPath = candidate;
                break;
            }
        }

        // Fallback: check which ollama using custom PATH
        if (!foundOllamaPath) {
            @try {
                NSTask *whichTask = [[NSTask alloc] init];
                [whichTask setLaunchPath:@"/bin/sh"];
                [whichTask setArguments:@[@"-c", @"export PATH=\"/opt/homebrew/bin:/usr/local/bin:$PATH\"; which ollama"]];
                NSPipe *pipe = [NSPipe pipe];
                [whichTask setStandardOutput:pipe];
                [whichTask launch];
                [whichTask waitUntilExit];
                if ([whichTask terminationStatus] == 0) {
                    NSString *outPath = [[[NSString alloc] initWithData:[[pipe fileHandleForReading] readDataToEndOfFile] encoding:NSUTF8StringEncoding] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                    if (outPath.length > 0 && [[NSFileManager defaultManager] isExecutableFileAtPath:outPath]) {
                        foundOllamaPath = outPath;
                    }
                }
            } @catch (NSException *e) {}
        }

        if (foundOllamaPath) {
            @try {
                NSTask *serveTask = [[NSTask alloc] init];
                [serveTask setLaunchPath:foundOllamaPath];
                [serveTask setArguments:@[@"serve"]];
                NSMutableDictionary *env = [[[NSProcessInfo processInfo] environment] mutableCopy];
                env[@"OLLAMA_ORIGINS"] = @"*";
                NSString *currPath = env[@"PATH"] ?: @"/usr/bin:/bin:/usr/sbin:/sbin";
                env[@"PATH"] = [NSString stringWithFormat:@"/opt/homebrew/bin:/usr/local/bin:%@", currPath];
                [serveTask setEnvironment:env];
                [serveTask launch];
            } @catch (NSException *e) {}
        } else if ([[NSFileManager defaultManager] fileExistsAtPath:@"/Applications/Ollama.app"]) {
            @try {
                NSTask *openApp = [[NSTask alloc] init];
                [openApp setLaunchPath:@"/usr/bin/open"];
                [openApp setArguments:@[@"-g", @"-a", @"Ollama"]];
                [openApp launch];
            } @catch (NSException *e) {}
        }
    });
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    [self startOllamaCORS];

    // Initialize & start local offline HTTP server
    NSString *resourcePath = [[NSBundle mainBundle] resourcePath];
    NSString *wwwPath = [resourcePath stringByAppendingPathComponent:@"www"];

    self.localServer = [[DomoLocalServer alloc] init];
    self.localServer.documentRoot = wwwPath;
    [self.localServer start];

    // Window Setup
    NSRect frame = NSMakeRect(0, 0, 1340, 880);
    NSUInteger style = NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable | NSWindowStyleMaskFullSizeContentView;
    
    self.window = [[NSWindow alloc] initWithContentRect:frame
                                              styleMask:style
                                                backing:NSBackingStoreBuffered
                                                  defer:NO];
    [self.window setTitle:@"DomoDomo"];
    [self.window setTitleVisibility:NSWindowTitleHidden];
    [self.window setTitlebarAppearsTransparent:YES];
    [self.window setBackgroundColor:[NSColor colorWithCalibratedRed:0.067 green:0.071 blue:0.075 alpha:1.0]]; // #111213
    [self.window center];
    [self.window setMinSize:NSMakeSize(900, 640)];
    [self.window setReleasedWhenClosed:NO];

    // WebKit Configuration with WebGPU and Offline Local Access
    WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
    config.preferences.javaScriptCanOpenWindowsAutomatically = YES;
    config.defaultWebpagePreferences.allowsContentJavaScript = YES;
    config.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone;
    [config.preferences setValue:@YES forKey:@"developerExtrasEnabled"];
    [config.preferences setValue:@YES forKey:@"webGLEnabled"];

    self.webView = [[WKWebView alloc] initWithFrame:[self.window.contentView bounds] configuration:config];
    [self.webView setAutoresizingMask:NSViewWidthSizable | NSViewHeightSizable];
    [self.webView setNavigationDelegate:self];
    [self.webView setUIDelegate:self];
    [self.webView setValue:@NO forKey:@"drawsBackground"];

    [self.window.contentView addSubview:self.webView];

    // Load from self-contained local offline server
    NSURL *localAppUrl = [NSURL URLWithString:[NSString stringWithFormat:@"http://127.0.0.1:%d", self.localServer.port]];
    NSURLRequest *request = [NSURLRequest requestWithURL:localAppUrl];
    [self.webView loadRequest:request];

    // Setup macOS Native Application Menus
    NSMenu *mainMenu = [[NSMenu alloc] init];
    
    // App Submenu
    NSMenuItem *appMenuItem = [[NSMenuItem alloc] init];
    [mainMenu addItem:appMenuItem];
    NSMenu *appMenu = [[NSMenu alloc] init];
    [appMenu addItemWithTitle:@"About DomoDomo" action:@selector(orderFrontStandardAboutPanel:) keyEquivalent:@""];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"Hide DomoDomo" action:@selector(hide:) keyEquivalent:@"h"];
    [appMenu addItemWithTitle:@"Hide Others" action:@selector(hideOtherApplications:) keyEquivalent:@"h"];
    [appMenu addItemWithTitle:@"Show All" action:@selector(unhideAllApplications:) keyEquivalent:@""];
    [appMenu addItem:[NSMenuItem separatorItem]];
    [appMenu addItemWithTitle:@"Quit DomoDomo" action:@selector(terminate:) keyEquivalent:@"q"];
    [appMenuItem setSubmenu:appMenu];

    // Edit Submenu (Cut, Copy, Paste, Select All)
    NSMenuItem *editMenuItem = [[NSMenuItem alloc] init];
    [mainMenu addItem:editMenuItem];
    NSMenu *editMenu = [[NSMenu alloc] initWithTitle:@"Edit"];
    [editMenu addItemWithTitle:@"Undo" action:@selector(undo:) keyEquivalent:@"z"];
    [editMenu addItemWithTitle:@"Redo" action:@selector(redo:) keyEquivalent:@"Z"];
    [editMenu addItem:[NSMenuItem separatorItem]];
    [editMenu addItemWithTitle:@"Cut" action:@selector(cut:) keyEquivalent:@"x"];
    [editMenu addItemWithTitle:@"Copy" action:@selector(copy:) keyEquivalent:@"c"];
    [editMenu addItemWithTitle:@"Paste" action:@selector(paste:) keyEquivalent:@"v"];
    [editMenu addItemWithTitle:@"Select All" action:@selector(selectAll:) keyEquivalent:@"a"];
    [editMenuItem setSubmenu:editMenu];

    // View Submenu (Reload, Full Screen)
    NSMenuItem *viewMenuItem = [[NSMenuItem alloc] init];
    [mainMenu addItem:viewMenuItem];
    NSMenu *viewMenu = [[NSMenu alloc] initWithTitle:@"View"];
    [viewMenu addItemWithTitle:@"Reload App" action:@selector(reloadApp:) keyEquivalent:@"r"];
    [viewMenu addItemWithTitle:@"Toggle Full Screen" action:@selector(toggleFullScreen:) keyEquivalent:@"f"];
    [viewMenuItem setSubmenu:viewMenu];

    // Window Submenu
    NSMenuItem *windowMenuItem = [[NSMenuItem alloc] init];
    [mainMenu addItem:windowMenuItem];
    NSMenu *windowMenu = [[NSMenu alloc] initWithTitle:@"Window"];
    [windowMenu addItemWithTitle:@"Minimize" action:@selector(performMiniaturize:) keyEquivalent:@"m"];
    [windowMenu addItemWithTitle:@"Zoom" action:@selector(performZoom:) keyEquivalent:@""];
    [windowMenuItem setSubmenu:windowMenu];

    [NSApp setMainMenu:mainMenu];
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
}

- (void)reloadApp:(id)sender {
    [self.webView reload];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        [app setActivationPolicy:NSApplicationActivationPolicyRegular];
        DomoAppDelegate *delegate = [[DomoAppDelegate alloc] init];
        [app setDelegate:delegate];
        [app run];
    }
    return 0;
}
