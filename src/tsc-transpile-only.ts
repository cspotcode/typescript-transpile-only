#!/usr/bin/env node
import * as ts from 'typescript';

function main() {
    // Parse command line
    const commandLine = ts.sys.args;
    const tempCompilerHost1 = ts.createCompilerHost({});
    const parsedCommandLine = ts.parseCommandLine(commandLine, tempCompilerHost1.readFile);
    handleConfigParsingErrors(parsedCommandLine, tempCompilerHost1, parsedCommandLine);
    ['build', 'init', 'version', 'help', 'all'].forEach(flag => {
        if(parsedCommandLine.options[flag]) {
            console.error(`--${ flag } option not supported.`);
            ts.sys.exit(1);
        }
    });

    // Parse config file, informed by command-line flags
    const tempCompilerHost2 = ts.createCompilerHost(parsedCommandLine.options, false);
    // from here https://github.com/Microsoft/TypeScript/blob/6fb0f6818ad48bf4f685e86c03405ddc84b530ed/src/compiler/program.ts#L2812
    const configParsingHost: ts.ParseConfigFileHost = {
        fileExists: f => tempCompilerHost2.fileExists(f),
        readDirectory: (root, extensions, includes, depth?) => tempCompilerHost2.readDirectory ? tempCompilerHost2.readDirectory(root, extensions, includes, depth) : [],
        readFile: f => tempCompilerHost2.readFile(f),
        useCaseSensitiveFileNames: tempCompilerHost2.useCaseSensitiveFileNames(),
        getCurrentDirectory: () => tempCompilerHost2.getCurrentDirectory(),
        onUnRecoverableConfigFileDiagnostic: () => undefined
    };
    const configFilePath = ts.findConfigFile(parsedCommandLine.options.project || configParsingHost.getCurrentDirectory(), configParsingHost.fileExists, parsedCommandLine.options.project);
    let parsedConfig: ts.ParsedCommandLine | undefined = parsedCommandLine;
    if(configFilePath) {
        parsedConfig = ts.getParsedCommandLineOfConfigFile(configFilePath!, parsedCommandLine.options, {
            ...configParsingHost,
            onUnRecoverableConfigFileDiagnostic(d) {
                handleDiagnostics([d], tempCompilerHost2, parsedCommandLine);
            }
        });
        handleConfigParsingErrors(parsedConfig, tempCompilerHost2, parsedCommandLine);
    }
    if(parsedConfig) {
        const compilerHost = ts.createCompilerHost(parsedConfig.options);
        const program = ts.createProgram({
            options: parsedConfig.options,
            configFileParsingDiagnostics: parsedConfig!.errors,
            rootNames: parsedConfig!.fileNames,
            host: compilerHost
        });

        const diagnostics = program.getSyntacticDiagnostics();
        handleDiagnostics(diagnostics, compilerHost, parsedConfig);

        const result = program.emit();
        handleDiagnostics(result.diagnostics, compilerHost, parsedConfig);
        // console.dir(result.emitSkipped);
        // console.dir(result.emittedFiles);
    }
}

function formatDiagnostics(d: ReadonlyArray<ts.Diagnostic>, host: ts.CompilerHost, config: ts.ParsedCommandLine) {
    if(shouldBePretty(config.options)) {
        return ts.formatDiagnosticsWithColorAndContext(d, {
            getCanonicalFileName(fileName) { return host.getCanonicalFileName(fileName) },
            getCurrentDirectory() { return host.getCurrentDirectory(); },
            getNewLine() { return host.getNewLine(); }
        });
    } else {
        return ts.formatDiagnostics(d, {
            getCanonicalFileName(fileName) { return host.getCanonicalFileName(fileName) },
            getCurrentDirectory() { return host.getCurrentDirectory(); },
            getNewLine() { return host.getNewLine(); }
        });
    }
}

// from https://github.com/Microsoft/TypeScript/blob/6fb0f6818ad48bf4f685e86c03405ddc84b530ed/src/tsc/tsc.ts
function shouldBePretty(options?: ts.CompilerOptions) {
    if (!options || typeof options.pretty === "undefined") {
        return defaultIsPretty();
    }
    return options.pretty;
    function defaultIsPretty() {
        return !!ts.sys.writeOutputIsTTY && ts.sys.writeOutputIsTTY();
    }
}

function handleDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>, host: ts.CompilerHost, config: ts.ParsedCommandLine) {
    if(diagnostics.length) {
        console.error(formatDiagnostics(diagnostics, host, config));
        ts.sys.exit(1);
    }
}
function handleConfigParsingErrors(parsedCommandLine: ts.ParsedCommandLine | undefined, host: ts.CompilerHost, config: ts.ParsedCommandLine) {
    if(parsedCommandLine && parsedCommandLine.errors.length) {
        console.error(formatDiagnostics(parsedCommandLine.errors, host, config));
        ts.sys.exit(1);
    }
    if(!parsedCommandLine) {
        console.error('Unknown error parsing config.');
        ts.sys.exit(1);
    }
}

main();
